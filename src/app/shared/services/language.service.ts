import { Injectable, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import Keycloak from 'keycloak-js';

export type AppLang = 'en' | 'es';

const STORAGE_KEY = 'moneipe_lang';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly translate = inject(TranslateService);
  private readonly keycloak = inject(Keycloak);

  readonly currentLang = signal<AppLang>(this.getInitialLang());

  constructor() {
    this.translate.use(this.currentLang());
    document.documentElement.lang = this.currentLang();
  }

  private getInitialLang(): AppLang {
    const stored = localStorage.getItem(STORAGE_KEY) as AppLang | null;
    if (stored === 'en' || stored === 'es') return stored;
    return navigator.language.startsWith('en') ? 'en' : 'es';
  }

  async setLang(lang: AppLang) {
    this.currentLang.set(lang);
    this.translate.use(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;

    if (this.keycloak.authenticated) {
      try {
        await this.keycloak.updateToken(30);
      } catch {
        // token refresh failed
      }
    }
  }

  toggleLang() {
    const next: AppLang = this.currentLang() === 'es' ? 'en' : 'es';
    this.setLang(next);
  }
}
