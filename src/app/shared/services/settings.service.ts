import {inject, Service} from '@angular/core';
import {AuthService} from '../../core/auth/auth.service';

@Service()
export class SettingsService {
  private readonly authService = inject(AuthService);

  hasAnyRole(roles?: string[]): boolean {
    return !roles || roles.some(role => this.authService.hasRole(role));
  }

  hasManageUsersRole(): boolean {
    return this.authService.hasRole('manage-users');
  }
}
