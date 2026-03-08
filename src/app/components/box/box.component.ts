import { Component, ChangeDetectionStrategy, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectionService } from '../../services/selection.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { OptionItem } from '../../models/interfaces';

/**
 * Presentation component representing an individual interactive box in the grid.
 * Binds directly to the SelectionService to determine its own active/filled state dynamically.
 */
@Component({
  selector: 'app-box',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="box"
      role="button"
      tabindex="0"
      [attr.aria-pressed]="isActive$ | async"
      [attr.aria-label]="
        (selection$ | async)
          ? 'Box ' + boxId + ' contains ' + (selection$ | async)?.name
          : 'Empty Box ' + boxId
      "
      [class.active]="isActive$ | async"
      [class.filled]="selection$ | async"
      (click)="onClick()"
      (keydown.enter)="onClick()"
      (keydown.space)="onClick(); $event.preventDefault()"
    >
      @if (selection$ | async; as selection) {
        <div class="selection-content">
          <span class="box-number">{{ boxId }}</span>
          @if (selection.imageUrl) {
            <img [src]="selection.imageUrl" alt="" class="box-img" />
          }
          <span class="selection-name">{{ selection.name }}</span>
          <span class="selection-value">{{ selection.value }}</span>
        </div>
      } @else {
        <span class="box-number empty">{{ boxId }}</span>
      }
    </div>
  `,
  styles: [
    `
      .box {
        width: 140px;
        height: 140px;
        border: 2px dashed #9bc4e2;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        position: relative;
        background-color: #f8fbff;
        border-radius: 12px;
        transition: all 0.2s ease;
        box-sizing: border-box;
      }
      .box:hover {
        border-color: #5b9bd5;
        transform: translateY(-2px);
      }
      .box.active {
        border: 3px solid #0056b3;
        background-color: #e6f2ff;
        box-shadow: 0 4px 12px rgba(0, 86, 179, 0.15);
      }
      .box.filled {
        border-style: solid;
        border-color: #4caf50;
        background-color: #f1f8e9;
      }
      .box.filled.active {
        border-color: #0056b3;
      }
      .box-number {
        position: absolute;
        top: 8px;
        left: 12px;
        font-size: 14px;
        color: #7b9ebc;
        font-weight: 700;
      }
      .box-number.empty {
        font-size: 42px;
        color: #d0e1f9;
        position: static;
      }
      .selection-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        text-align: center;
      }
      .selection-name {
        font-weight: 600;
        color: #2c3e50;
        font-size: 16px;
      }
      .selection-value {
        font-size: 14px;
        color: #fff;
        background-color: #4caf50;
        padding: 2px 8px;
        border-radius: 12px;
        font-weight: bold;
      }
      .box-img {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        object-fit: cover;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
      }
    `,
  ],
})
export class BoxComponent implements OnInit {
  @Input({ required: true }) public boxId!: number;

  public isActive$!: Observable<boolean>;
  public selection$!: Observable<OptionItem | null>;

  constructor(private selectionService: SelectionService) {}

  public ngOnInit() {
    this.isActive$ = this.selectionService.activeBoxId$.pipe(
      map((activeId) => activeId === this.boxId),
    );
    this.selection$ = this.selectionService.getSelectionForBox(this.boxId);
  }

  /**
   * Dispatches the local box ID to the service when clicked.
   */
  public onClick() {
    this.selectionService.boxSelected$.next(this.boxId);
  }
}
