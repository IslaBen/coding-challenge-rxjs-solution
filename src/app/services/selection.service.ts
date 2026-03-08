import { Injectable } from '@angular/core';
import { Subject, Observable, merge } from 'rxjs';
import { map, shareReplay, scan, startWith, tap } from 'rxjs/operators';
import { OptionItem, SelectionState } from '../models/interfaces';

const STORAGE_KEY = 'interactive_box_state';
const OPTIONS_STORAGE_KEY = 'interactive_box_options';
const TOTAL_BOXES = 10;

type StateReducer = (state: SelectionState) => SelectionState;

/**
 * Core RxJS State Service managing the interactive boxes.
 * Utilizes a functional `scan` and `merge` reducer architecture to map UI events into a unified state stream.
 */
@Injectable({
  providedIn: 'root',
})
export class SelectionService {
  // Action Streams
  /** Subject emitted when a box is clicked. Payload is the box ID. */
  public boxSelected$ = new Subject<number>();
  /** Subject emitted when a user selects an option. Payload is the selected OptionItem. */
  public optionSelected$ = new Subject<OptionItem>();
  /** Subject emitted when the user clears all UI selections and resets the board. */
  public clearAllSelections$ = new Subject<void>();

  // Derived State
  /** Unified, immutable snapshot of the entire selection state over time. */
  public state$: Observable<SelectionState>;
  /** The currently active box awaiting selection. Null if none selected. */
  public activeBoxId$: Observable<number | null>;
  /** Record mapping box IDs to their selected option data. */
  public selections$: Observable<Record<number, OptionItem | null>>;
  /** Total calculated score value across all filled boxes. */
  public totalValue$: Observable<number>;

  // Mock data for options
  /** Dummy payload array defining all available option choices within the application. */
  public readonly availableOptions: OptionItem[];

  /**
   * Constructs the reactive reducer pipeline, wiring action `Subject`s into localized map reducers,
   * merging them down into a single stream, and storing the emitted snapshot in `localStorage` via a side effect.
   */
  constructor() {
    this.availableOptions = this.loadOrGenerateOptions();
    const initialState = this.loadInitialState();

    const boxReducer$: Observable<StateReducer> = this.boxSelected$.pipe(
      map((boxId) => (state: SelectionState) => ({ ...state, activeBoxId: boxId })),
    );

    const clearReducer$: Observable<StateReducer> = this.clearAllSelections$.pipe(
      map(() => () => ({
        activeBoxId: null,
        selections: {},
        totalValue: 0,
      })),
    );

    const optionReducer$: Observable<StateReducer> = this.optionSelected$.pipe(
      map((option) => (state: SelectionState) => {
        if (state.activeBoxId === null) return state;

        const newSelections = { ...state.selections, [state.activeBoxId]: option };
        let newTotal = 0;
        for (const key in newSelections) {
          if (newSelections[key]) {
            newTotal += newSelections[key]!.value;
          }
        }

        let nextBoxId = state.activeBoxId + 1;
        if (nextBoxId > TOTAL_BOXES) {
          nextBoxId = state.activeBoxId; // stay on last if boundary
        }

        return {
          selections: newSelections,
          activeBoxId: nextBoxId,
          totalValue: newTotal,
        };
      }),
    );

    this.state$ = merge(boxReducer$, clearReducer$, optionReducer$).pipe(
      scan((state: SelectionState, reducer: StateReducer) => reducer(state), initialState),
      startWith(initialState),
      tap((state) => {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (e) {}
      }),
      shareReplay({ bufferSize: 1, refCount: true }),
    );

    this.activeBoxId$ = this.state$.pipe(map((s) => s.activeBoxId));
    this.selections$ = this.state$.pipe(map((s) => s.selections));
    this.totalValue$ = this.state$.pipe(map((s) => s.totalValue));
  }

  /**
   * Helper pipe extracting precisely the requested box's mapping from the shared `selections$` record.
   *
   * @param boxId - The ID of the box you wish to retrieve.
   * @returns An observable of `OptionItem` or `null` if the box is empty.
   */
  public getSelectionForBox(boxId: number): Observable<OptionItem | null> {
    return this.selections$.pipe(
      map((selections) => selections[boxId] || null),
      shareReplay({ bufferSize: 1, refCount: true }),
    );
  }

  /**
   * Initializes the starting payload dynamically, attempting to hydrate any previous session directly from `localStorage`.
   * @private
   * @returns Bootstrapped application default state.
   */
  private loadInitialState(): SelectionState {
    const defaultState: SelectionState = {
      activeBoxId: null,
      selections: {},
      totalValue: 0,
    };
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed) {
          return { ...defaultState, ...parsed };
        }
      }
    } catch (e) {}
    return defaultState;
  }

  /**
   * Loads options from localStorage if they exist, otherwise generates new ones and saves them.
   * This stabilizes the random point values and images between page reloads.
   */
  private loadOrGenerateOptions(): OptionItem[] {
    try {
      const storedOptions = localStorage.getItem(OPTIONS_STORAGE_KEY);
      if (storedOptions) {
        return JSON.parse(storedOptions);
      }
    } catch (e) {}

    const generatedOptions = Array.from({ length: 15 }).map((_, i) => ({
      id: `opt-${i + 1}`,
      name: `Option ${String.fromCharCode(65 + i)}`,
      value: Math.floor(Math.random() * 50) + 10,
      imageUrl: `https://picsum.photos/seed/${i + 1}/80/80`,
    }));

    try {
      localStorage.setItem(OPTIONS_STORAGE_KEY, JSON.stringify(generatedOptions));
    } catch (e) {}

    return generatedOptions;
  }
}
