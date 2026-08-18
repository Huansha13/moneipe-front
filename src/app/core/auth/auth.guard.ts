import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot } from '@angular/router';
import Keycloak from 'keycloak-js';
import { AuthGuardData, createAuthGuard } from 'keycloak-angular';
import { AuthService } from './auth.service';

const checkUserAuthenticated = async (
  _route: ActivatedRouteSnapshot,
  _state: RouterStateSnapshot,
  authData: AuthGuardData
): Promise<boolean> => {
  const { authenticated } = authData;

  if (!authenticated) {
    const keycloak = inject(Keycloak);
    await keycloak.login();
    return false;
  }

  const authService = inject(AuthService);
  await authService.loadUserProfile();
  return true;
};

export const authGuard = createAuthGuard<CanActivateFn>(checkUserAuthenticated);
