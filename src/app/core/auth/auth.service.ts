import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Keycloak from 'keycloak-js';
import { environment } from '../../../environments/environment';
import { LanguageService } from '../../shared/services/language.service';
import { firstValueFrom } from 'rxjs';
import { UsuarioResponse } from './models/usuario-response.model';
import { EMPTY_PROFILE, UserProfile } from './models/user-profile.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly keycloak = inject(Keycloak);
  private readonly http = inject(HttpClient);
  private readonly language = inject(LanguageService);

  private get apiUrl(): string {
    return `${environment.apiUrl}/api/usuarios`;
  }

  readonly profile = signal<UserProfile>(EMPTY_PROFILE);

  async loadUserProfile() {
    if (!this.keycloak.authenticated) {
      this.buildProfileFromKeycloak();
      return;
    }
    const userId = this.keycloak.subject;
    if (userId) {
      try {
        const u = await firstValueFrom(
          this.http.get<UsuarioResponse>(`${this.apiUrl}/${userId}`)
        );
        this.buildProfileFromApi(u);
        return;
      } catch {
        // Usuario no existe en nuestra BD aún → usar perfil de Keycloak
      }
    }
    if (!this.keycloak.profile) {
      await this.keycloak.loadUserProfile();
    }
    this.buildProfileFromKeycloak();
  }

  async updateProfile(data: { firstName: string; lastName: string; email: string }) {
    const userId = this.keycloak.subject;
    if (!userId) return;

    await firstValueFrom(
      this.http.put(
        `${this.apiUrl}/${userId}`,
        {
          nombres: data.firstName,
          apellidos: data.lastName,
          email: data.email,
        }
      )
    );

    // Recargar perfil desde nuestro backend (no desde Keycloak)
    const u = await firstValueFrom(
      this.http.get<UsuarioResponse>(`${this.apiUrl}/${userId}`)
    );
    this.buildProfileFromApi(u);
  }

  private buildProfileFromApi(u: UsuarioResponse) {
    const firstName = u.nombres ?? '';
    const lastName = u.apellidos ?? '';
    const username = u.username ?? this.keycloak.profile?.username ?? '';
    const email = u.email ?? '';

    this.profile.set({
      userId: u.id,
      username,
      email,
      firstName,
      lastName,
      firstNameShort: firstName.split(' ')[0] ?? '',
      lastNameShort: lastName.split(' ')[0] ?? '',
      fullName: `${firstName} ${lastName}`.trim() || username,
      initials: `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase() || username.slice(0, 2).toUpperCase(),
      emailVerified: true,
      roles: this.keycloak.tokenParsed?.realm_access?.roles ?? [],
    });
  }

  private buildProfileFromKeycloak() {
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

  async login() {
    await this.keycloak.login({ locale: this.language.currentLang() });
  }

  async logout() {
    await this.keycloak.logout({ redirectUri: window.location.origin });
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const userId = this.keycloak.subject;

    await firstValueFrom(
      this.http.put(
        `${this.apiUrl}/${userId}/password`,
        { password: newPassword }
      )
    );
  }

  hasRole(role: string): boolean {
    return this.keycloak.hasRealmRole(role);
  }

}
