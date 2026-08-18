import {Component, inject, Input} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LanguageService } from '../../services/language.service';
import {MatListItem, MatListItemIcon, MatListItemTitle} from '@angular/material/list';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-language-switcher',
  imports: [MatButtonModule, MatIconModule, MatTooltipModule, MatListItem, MatListItemIcon, MatListItemTitle, TranslatePipe],
  template: `
    @if (listMode) {
      <mat-list-item (click)="language.toggleLang()" onKeyUp="">
        <mat-icon matListItemIcon>language</mat-icon>
        <div matListItemTitle>
          {{language.currentLang() === 'es' ? 'Switch to English' : 'Cambiar a Español'}}
        </div>
      </mat-list-item>
    } @else {
      <button
        mat-button
        (click)="language.toggleLang()"
        [matTooltip]="language.currentLang() === 'es' ? 'Switch to English' : 'Cambiar a Español'">
        <mat-icon>{{ language.currentLang() === 'es' ? 'language_spanish' : 'language_us' }}</mat-icon>
      </button>
    }
  `,
})
export class LanguageSwitcherComponent {
  @Input() listMode: boolean = false;
  language = inject(LanguageService);
}
