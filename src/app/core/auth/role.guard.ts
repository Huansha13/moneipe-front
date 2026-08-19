import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const roleGuard = (requiredRoles: string[]): CanActivateFn => {
  return async (_route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Promise<boolean> => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const hasRequiredRole = requiredRoles.some(role => authService.hasRole(role));

    if (!hasRequiredRole) {
      await router.navigate(['/dashboard']);
      return false;
    }

    return true;
  };
};
