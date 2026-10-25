import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { firstValueFrom } from 'rxjs';
import { UsuarioResponse } from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly http = inject(HttpClient);

  private get apiUrl(): string {
    return `${environment.apiUrl}/api/usuarios`;
  }

  async createUser(data: {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    enabled: boolean;
  }): Promise<void> {
    const payload = {
      username: data.username,
      email: data.email,
      nombres: data.firstName,
      apellidos: data.lastName,
      password: data.password,
    };

    await firstValueFrom(
      this.http.post(this.apiUrl, payload)
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
    const usuarios = await firstValueFrom(
      this.http.get<UsuarioResponse[]>(this.apiUrl)
    );

    return usuarios.map(u => ({
      id: u.id,
      username: u.username,
      email: u.email,
      firstName: u.nombres,
      lastName: u.apellidos,
      enabled: u.activo,
    }));
  }

  async updateUser(userId: string, data: {
    email: string;
    firstName: string;
    lastName: string;
    enabled: boolean;
  }): Promise<void> {
    const payload = {
      nombres: data.firstName,
      apellidos: data.lastName,
      email: data.email,
    };

    await firstValueFrom(
      this.http.put(`${this.apiUrl}/${userId}`, payload)
    );

    if (!data.enabled) {
      await firstValueFrom(
        this.http.delete(`${this.apiUrl}/${userId}`)
      );
    }
  }

  async deleteUser(userId: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${this.apiUrl}/${userId}`)
    );
  }

  async resetPassword(userId: string, newPassword: string): Promise<void> {
    await firstValueFrom(
      this.http.put(`${this.apiUrl}/${userId}/password`, { password: newPassword })
    );
  }
}
