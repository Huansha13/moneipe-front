import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { firstValueFrom } from 'rxjs';
import { Group, GroupMember } from '../models/group.model';
import { GrupoResponse, MiembroResponse } from '../models/grupo-response.model';

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  private readonly http = inject(HttpClient);

  private get apiUrl(): string {
    return `${environment.apiUrl}/api/gastos`;
  }

  private readonly groupsSignal = signal<Group[]>([]);
  private loaded = false;

  groups = this.groupsSignal.asReadonly();
  groupCount = computed(() => this.groupsSignal().length);

  loadGroups(): void {
    if (this.loaded) return;
    this.loaded = true;
    this.http.get<GrupoResponse[]>(`${this.apiUrl}/grupos`).subscribe({
      next: (grupos) => {
        const groups: Group[] = grupos.map(g => ({
          id: g.id,
          title: g.nombre,
          description: g.descripcion ?? '',
          role: 'MIEMBRO',
          members: [],
        }));
        this.groupsSignal.set(groups);
        groups.forEach(g => this.loadMembers(g.id));
      },
      error: (err) => console.error('Error cargando grupos:', err),
    });
  }

  private loadMembers(grupoId: string): void {
    this.http.get<MiembroResponse[]>(`${this.apiUrl}/grupos/${grupoId}/miembros`).subscribe({
      next: (miembros) => {
        this.groupsSignal.update(current =>
          current.map(g => g.id === grupoId
            ? { ...g, members: miembros.map(m => ({
                id: m.usuarioId,
                name: m.usuarioId,
                email: '',
                role: m.rol === 'ADMIN' ? 'ADMIN' : 'MIEMBRO',
              })) }
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

  setGroups(newGroups: Group[]) {
    this.groupsSignal.set(newGroups);
  }

  addGroup(group: Group) {
    this.groupsSignal.update(current => [...current, group]);
  }
}
export type { Group, GroupMember } from '../models/group.model';
