import {Component, inject, input} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {LanguageService} from '../../services/language.service';
import {MatListItem, MatListItemIcon, MatListItemTitle} from '@angular/material/list';

@Component({
  selector: 'app-language-switcher',
  imports: [MatButtonModule, MatIconModule, MatTooltipModule, MatListItem, MatListItemIcon, MatListItemTitle],
  template: `
    @if (listMode()) {
      <mat-list-item (click)="toggleLang()" onKeyUp="">
        <mat-icon matListItemIcon>language</mat-icon>
        <div matListItemTitle>
          {{ currentLang === 'es' ? 'Switch to English' : 'Cambiar a Español' }}
        </div>
      </mat-list-item>
    } @else {
      <button
        mat-button
        (click)="toggleLang()"
        [matTooltip]="currentLang === 'es' ? 'Switch to English' : 'Cambiar a Español'">
        <mat-icon>{{ currentLang === 'es' ? 'language_spanish' : 'language_us' }}</mat-icon>
      </button>
    }
  `,
})
export class LanguageSwitcherComponent {
  private readonly language = inject(LanguageService);

  listMode = input(false);

  get currentLang(): string {
    return this.language.currentLang();
  }

  toggleLang(): void {
    this.language.toggleLang();
  }
}
