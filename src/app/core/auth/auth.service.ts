import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Keycloak from 'keycloak-js';
import { environment } from '../../../environments/environment';
import { LanguageService } from '../../shared/services/language.service';
import { firstValueFrom } from 'rxjs';

interface UserProfile {
  userId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  firstNameShort: string;
  lastNameShort: string;
  fullName: string;
  initials: string;
  emailVerified: boolean;
  roles: string[];
}

const EMPTY_PROFILE: UserProfile = {
  userId: '',
  username: '',
  email: '',
  firstName: '',
  lastName: '',
  firstNameShort: '',
  lastNameShort: '',
  fullName: '',
  initials: '',
  emailVerified: false,
  roles: [],
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly keycloak = inject(Keycloak);
  private readonly http = inject(HttpClient);
  private readonly language = inject(LanguageService);

  readonly profile = signal<UserProfile>(EMPTY_PROFILE);

  async loadUserProfile() {
    if (!this.keycloak.authenticated) {
      this.buildProfile();
      return;
    }
    if (!this.keycloak.profile) {
      await this.keycloak.loadUserProfile();
    }
    this.buildProfile();
  }

  async updateProfile(data: { firstName: string; lastName: string; email: string }) {
    await this.keycloak.updateToken(30);

    await firstValueFrom(
      this.http.post(
        `${environment.keycloak.url}/realms/${environment.keycloak.realm}/account`,
        data,
        {
          headers: { Authorization: `Bearer ${this.keycloak.token}` },
        }
      )
    );

    await this.keycloak.loadUserProfile();
    this.buildProfile();
  }

  async login() {
    await this.keycloak.login({ locale: this.language.currentLang() });
  }

  async logout() {
    await this.keycloak.logout({ redirectUri: window.location.origin });
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await this.keycloak.updateToken(30);

    const userId = this.keycloak.subject;

    await firstValueFrom(
      this.http.put(
        `${environment.keycloak.url}/admin/realms/${environment.keycloak.realm}/users/${userId}/reset-password`,
        {
          type: 'password',
          value: newPassword,
          temporary: false,
        },
        {
          headers: { Authorization: `Bearer ${this.keycloak.token}` },
        }
      )
    );
  }

  hasRole(role: string): boolean {
    return this.keycloak.hasRealmRole(role);
  }

  private buildProfile() {
    const p = this.keycloak.profile;
    const firstName = p?.firstName ?? '';
    const lastName = p?.lastName ?? '';
    const username = p?.username ?? '';

    this.profile.set({
      userId: this.keycloak.subject ?? '',
      username,
      email: p?.email ?? '',
      firstName,
      lastName,
      firstNameShort: firstName.split(' ')[0] ?? '',
      lastNameShort: lastName.split(' ')[0] ?? '',
      fullName: `${firstName} ${lastName}`.trim() || username,
      initials: `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase() || username.slice(0, 2).toUpperCase(),
      emailVerified: p?.emailVerified ?? false,
      roles: this.keycloak.tokenParsed?.realm_access?.roles ?? [],
    });
  }
}
