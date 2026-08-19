import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton',
  imports: [CommonModule],
  template: `
    @for (item of skeletonRows(); track item) {
      <div class="skeleton-row" [style.height]="height()"></div>
    }
  `,
  styles: `
    .skeleton-row {
      background: linear-gradient(
        90deg,
        var(--color-surface, #fff) 25%,
        var(--color-outline-variant, rgba(0, 0, 0, 0.12)) 50%,
        var(--color-surface, #fff) 75%
      );
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 4px;
      margin-bottom: 8px;
    }

    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
  `,
})
export class SkeletonComponent {
  rows = input(5);
  height = input('40px');

  skeletonRows = computed(() => Array.from({ length: this.rows() }, (_, i) => i));
}
