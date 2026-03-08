import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoxComponent } from '../box/box.component';

@Component({
  selector: 'app-box-grid',
  standalone: true,
  imports: [CommonModule, BoxComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="box-grid" role="group" aria-label="Interactive Boxes">
      @for (id of boxIds; track id) {
        <app-box [boxId]="id"></app-box>
      }
    </div>
  `,
  styles: [
    `
      .box-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
        max-width: 800px;
      }
    `,
  ],
})
export class BoxGridComponent {
  public boxIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
}
