import {Component, inject, Input, input, InputSignal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {TranslateService} from '@ngx-translate/core';

type LoadingType = 'spinner' | 'bar';
@Component({
  selector: 'app-loading-information',
  imports: [CommonModule, MatProgressSpinnerModule, MatProgressBarModule],
  template: `
    @if (loading()) {
      @if (active() === 'spinner') {
       <div class="d-flex flex-column align-items-center justify-content-center gap-4">
         <mat-progress-spinner mode="indeterminate" class="loading-spinner"></mat-progress-spinner>
         <span class="text-muted">{{ mss }}</span>
       </div>
      }

      @if (active() === 'bar') {
        <mat-progress-bar mode="indeterminate"></mat-progress-bar>
      }
    }
  `,
})
export class LoadingInformationComponent {
  private readonly translate = inject(TranslateService);
  active: InputSignal<LoadingType> = input('spinner' as LoadingType);
  loading = input(false);
  message = input('');

  get mss() {
    return this.message() || this.translate.instant('LOADING.INFORMATION');
  }
}
