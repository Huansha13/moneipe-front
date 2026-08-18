import {
  createInterceptorCondition,
  IncludeBearerTokenCondition,
} from 'keycloak-angular';
import { environment } from '../../../environments/environment';

const escapedUrl = environment.apiUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const apiCondition = createInterceptorCondition<IncludeBearerTokenCondition>({
  urlPattern: new RegExp(`^${escapedUrl}(\/.*)?$`, 'i'),
  bearerPrefix: 'Bearer',
});
