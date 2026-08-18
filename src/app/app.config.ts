import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideKeycloak } from 'keycloak-angular';
import { includeBearerTokenInterceptor, INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG } from 'keycloak-angular';
import { environment } from '../environments/environment';
import { routes } from './app.routes';
import { apiCondition } from './core/interceptors/bearer.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideKeycloak({
      config: {
        url: environment.keycloak.url,
        realm: environment.keycloak.realm,
        clientId: environment.keycloak.clientId,
      },
      initOptions: {
        onLoad: 'check-sso',
        checkLoginIframe: false,
      },
    }),
    {
      provide: INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
      useValue: [apiCondition],
    },
    provideHttpClient(withInterceptors([includeBearerTokenInterceptor])),
    provideRouter(routes),
  ],
};
