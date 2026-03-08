import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectionService } from '../../services/selection.service';
import { OptionItem } from '../../models/interfaces';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Presentation component rendering the list of choice payloads.
 * Evaluates the active box state and emits selected payloads to the SelectionService pipeline.
 */
@Component({
  selector: 'app-option-selector',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (activeBoxId$ | async; as activeBoxId) {
      <div class="option-selector-panel" role="region" aria-live="polite">
        <h3 id="option-select-heading">Select an option for Box {{ activeBoxId }}</h3>
        <div class="options-grid" role="listbox" aria-labelledby="option-select-heading">
          @for (option of options; track option.id) {
            <div
              class="option-card"
              role="option"
              tabindex="0"
              [attr.aria-selected]="(activeSelectionId$ | async) === option.id"
              [class.selected]="(activeSelectionId$ | async) === option.id"
              (click)="onOptionSelect(option)"
              (keydown.enter)="onOptionSelect(option)"
              (keydown.space)="onOptionSelect(option); $event.preventDefault()"
            >
              @if (option.imageUrl) {
                <img [src]="option.imageUrl" [alt]="option.name" class="opt-img" />
              }
              <div class="opt-name">{{ option.name }}</div>
              <div class="opt-val">{{ option.value }}</div>
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [
    `
      .option-selector-panel {
        padding: 24px;
        background-color: #fff;
        border-radius: 12px;
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
        margin-top: 24px;
        border: 1px solid #eaeaea;
      }
      h3 {
        margin-top: 0;
        color: #333;
        font-size: 18px;
      }
      .options-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        gap: 12px;
        margin-top: 16px;
      }
      .option-card {
        padding: 12px;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        cursor: pointer;
        text-align: center;
        transition: all 0.2s;
      }
      .option-card:hover {
        border-color: #2196f3;
        background-color: #f5faff;
      }
      .option-card.selected {
        border-color: #2196f3;
        background-color: #e3f2fd;
        box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
      }
      .opt-name {
        font-weight: 600;
        font-size: 14px;
        color: #444;
        margin-bottom: 4px;
      }
      .opt-val {
        font-size: 13px;
        color: #888;
      }
      .opt-img {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        margin-bottom: 8px;
        object-fit: cover;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
      }
    `,
  ],
})
export class OptionSelectorComponent {
  public options: OptionItem[];
  public activeBoxId$: Observable<number | null>;
  public activeSelectionId$: Observable<string | null>;

  constructor(private selectionService: SelectionService) {
    this.options = this.selectionService.availableOptions;
    this.activeBoxId$ = this.selectionService.activeBoxId$;

    // Derive selected ID for pre-selection highlight
    this.activeSelectionId$ = combineLatest([
      this.selectionService.activeBoxId$,
      this.selectionService.selections$,
    ]).pipe(
      map(([activeId, selections]) => {
        if (activeId !== null && selections[activeId]) {
          return selections[activeId]!.id;
        }
        return null;
      }),
    );
  }

  /**
   * Dispatches the chosen `OptionItem` payload mapping.
   * @param option The interacted option payload
   */
  public onOptionSelect(option: OptionItem) {
    this.selectionService.optionSelected$.next(option);
  }
}
