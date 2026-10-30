import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import Keycloak from 'keycloak-js';
import { Group } from '../models/group.model';
import { GrupoResponse, MiembroResponse } from '../models/grupo-response.model';

export type { Group, GroupMember } from '../models/group.model';

interface UserInfo {
  id: string;
  name: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly keycloak = inject(Keycloak);

  private get apiUrl(): string {
    return `${environment.apiUrl}/api/gastos`;
  }

  private get usuariosUrl(): string {
    return `${environment.apiUrl}/api/usuarios`;
  }

  private readonly groupsSignal = signal<Group[]>([]);
  private readonly usersMap = signal<Map<string, UserInfo>>(new Map());
  private loaded = false;
  private usersLoaded = false;

  groups = this.groupsSignal.asReadonly();
  groupCount = computed(() => this.groupsSignal().length);

  loadGroups(): void {
    if (this.loaded) return;
    this.ensureUsersLoaded();
    this.http.get<GrupoResponse[]>(`${this.apiUrl}/grupos`).subscribe({
      next: (grupos) => {
        this.loaded = true;
        const currentUserId = this.keycloak.subject ?? this.authService.profile().userId;
        const groups: Group[] = grupos.map(g => ({
          id: g.id,
          title: g.nombre,
          description: g.descripcion ?? '',
          role: 'MIEMBRO',
          members: [],
        }));
        this.groupsSignal.set(groups);
        groups.forEach(g => this.loadMembers(g.id, currentUserId));
      },
      error: (err) => {
        console.error('Error cargando grupos:', err);
        this.loaded = false; // allow retry
      },
    });
  }

  reloadGroups(): void {
    this.loaded = false;
    this.loadGroups();
  }

  private ensureUsersLoaded(): void {
    if (this.usersLoaded) return;
    this.usersLoaded = true;
    this.http.get<any[]>(this.usuariosUrl).subscribe({
      next: (usuarios) => {
        const map = new Map<string, UserInfo>();
        usuarios.forEach(u => {
          map.set(u.id, {
            id: u.id,
            name: `${u.nombres ?? ''} ${u.apellidos ?? ''}`.trim() || u.username,
            email: u.email ?? '',
          });
        });
        this.usersMap.set(map);
        // Re-process members with names
        this.groupsSignal.update(current =>
          current.map(g => ({
            ...g,
            members: g.members.map(m => {
              const info = map.get(m.id);
              return info ? { ...m, name: info.name, email: info.email } : m;
            }),
          }))
        );
      },
      error: () => { /* sin permisos de usuarios: se muestran UUIDs */ },
    });
  }

  private loadMembers(grupoId: string, currentUserId: string): void {
    this.http.get<MiembroResponse[]>(`${this.apiUrl}/grupos/${grupoId}/miembros`).subscribe({
      next: (miembros) => {
        const users = this.usersMap();
        const members = miembros.map(m => {
          const info = users.get(m.usuarioId);
          return {
            id: m.usuarioId,
            name: info?.name ?? m.usuarioId,
            email: info?.email ?? '',
            role: m.rol === 'ADMIN' ? 'ADMIN' as const : 'MIEMBRO' as const,
          };
        });

        // Determinar el rol del usuario actual en este grupo
        const currentMember = members.find(m => m.id === currentUserId);
        const userRole = currentMember?.role ?? 'MIEMBRO';

        this.groupsSignal.update(current =>
          current.map(g => g.id === grupoId
            ? { ...g, members, role: userRole }
            : g
          )
        );
      },
      error: (err) => console.error('Error cargando miembros:', err),
    });
  }

  async crearGrupo(titulo: string, descripcion: string, memberIds: string[]): Promise<void> {
    await firstValueFrom(
      this.http.post(`${this.apiUrl}/grupos`, {
        titulo,
        descripcion,
        memberIds,
      })
    );
  }

  async salirGrupo(grupoId: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${this.apiUrl}/grupos/${grupoId}/salir`)
    );
  }

  async getGroupMembersUsers(groupId: string): Promise<any[]> {
    return await firstValueFrom(
      this.http.get<any[]>(`${this.apiUrl}/grupos/${groupId}/miembros/usuarios`)
    );
  }

  async addMember(grupoId: string, usuarioId: string, rol: string): Promise<void> {
    await firstValueFrom(
      this.http.post(`${this.apiUrl}/grupos/${grupoId}/miembros`, { usuarioId, rol })
    );
  }

  async removeMember(grupoId: string, usuarioId: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${this.apiUrl}/grupos/${grupoId}/miembros/${usuarioId}`)
    );
  }
}
