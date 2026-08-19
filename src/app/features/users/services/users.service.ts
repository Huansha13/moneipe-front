import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Keycloak from 'keycloak-js';
import { environment } from '../../../../environments/environment';
import { firstValueFrom } from 'rxjs';

export interface CreateUserRequest {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  enabled: boolean;
  credentials: Array<{
    type: string;
    value: string;
    temporary: boolean;
  }>;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly keycloak = inject(Keycloak);

  private get adminUrl(): string {
    return `${environment.keycloak.url}/admin/realms/${environment.keycloak.realm}`;
  }

  private get headers() {
    return { Authorization: `Bearer ${this.keycloak.token}` };
  }

  async createUser(data: {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    enabled: boolean;
  }): Promise<void> {
    await this.keycloak.updateToken(30);

    const payload: CreateUserRequest = {
      username: data.username,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      enabled: data.enabled,
      credentials: [
        {
          type: 'password',
          value: data.password,
          temporary: true,
        },
      ],
    };

    await firstValueFrom(
      this.http.post(`${this.adminUrl}/users`, payload, { headers: this.headers })
    );
  }

  async getUsers(): Promise<Array<{
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    enabled: boolean;
  }>> {
    await this.keycloak.updateToken(30);

    return firstValueFrom(
      this.http.get<Array<{
        id: string;
        username: string;
        email: string;
        firstName: string;
        lastName: string;
        enabled: boolean;
      }>>(`${this.adminUrl}/users`, { headers: this.headers })
    );
  }

  async updateUser(userId: string, data: {
    email: string;
    firstName: string;
    lastName: string;
    enabled: boolean;
  }): Promise<void> {
    await this.keycloak.updateToken(30);

    await firstValueFrom(
      this.http.put(`${this.adminUrl}/users/${userId}`, data, { headers: this.headers })
    );
  }

  async deleteUser(userId: string): Promise<void> {
    await this.keycloak.updateToken(30);

    await firstValueFrom(
      this.http.delete(`${this.adminUrl}/users/${userId}`, { headers: this.headers })
    );
  }
}
