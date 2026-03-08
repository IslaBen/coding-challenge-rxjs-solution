import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoxGridComponent } from './components/box-grid/box-grid.component';
import { OptionSelectorComponent } from './components/option-selector/option-selector.component';
import { SelectionService } from './services/selection.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, BoxGridComponent, OptionSelectorComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="app-container">
      <header class="app-header">
        <h1>Interactive Box Selection (RxJS)</h1>
        <div class="total-score" aria-live="polite">
          Total Value: <strong>{{ totalValue$ | async }}</strong>
        </div>
        <button class="clear-btn" (click)="onClear()">Clear All Selections</button>
      </header>

      <main class="main-content">
        <div class="grid-section">
          <app-box-grid></app-box-grid>
        </div>
        <div class="selector-section">
          <app-option-selector></app-option-selector>
        </div>
      </main>
    </div>
  `,
  styles: [
    `
      .app-container {
        font-family: 'Inter', 'Segoe UI', sans-serif;
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
      }
      .app-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid #eaeaea;
        padding-bottom: 20px;
        margin-bottom: 30px;
      }
      h1 {
        margin: 0;
        color: #2c3e50;
        font-size: 24px;
      }
      .total-score {
        font-size: 20px;
        color: #333;
        background: #e3f2fd;
        padding: 8px 16px;
        border-radius: 20px;
        border: 1px solid #bbdefb;
      }
      .total-score strong {
        color: #1565c0;
      }
      .clear-btn {
        background-color: #ef5350;
        color: white;
        border: none;
        padding: 10px 20px;
        font-size: 14px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        transition: background 0.2s;
      }
      .clear-btn:hover {
        background-color: #d32f2f;
      }
      .main-content {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
    `,
  ],
})
export class AppComponent {
  public totalValue$: Observable<number>;

  constructor(private selectionService: SelectionService) {
    this.totalValue$ = this.selectionService.totalValue$;
  }

  public onClear() {
    this.selectionService.clearAllSelections$.next();
  }
}
