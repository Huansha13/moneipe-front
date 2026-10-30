import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { firstValueFrom } from 'rxjs';
import { Control } from '../models/control.model';

@Injectable({
  providedIn: 'root'
})
export class ControlService {
  private readonly http = inject(HttpClient);

  private get apiUrl(): string {
    return `${environment.apiUrl}/api/gastos`;
  }

  private readonly controlsSignal = signal<Control[]>([]);
  private readonly gastosSignal = signal<Record<string, any[]>>({});
  private readonly pinnedSignal = signal<string | null>(localStorage.getItem('pinnedControlId'));
  private readonly deletedSignal = signal<Set<string>>(new Set(JSON.parse(localStorage.getItem('deletedControls') || '[]')));
  deletedIds = this.deletedSignal.asReadonly();
  private loaded = false;

  controls = this.controlsSignal.asReadonly();
  sortedControls = computed(() => {
    const pinned = this.pinnedSignal();
    const list = this.controlsSignal();
    if (!pinned) return list;
    const pinnedItem = list.find(c => c.id === pinned);
    if (!pinnedItem) return list;
    return [pinnedItem, ...list.filter(c => c.id !== pinned)];
  });
  controlCount = computed(() => this.controlsSignal().length);
  gastos = this.gastosSignal.asReadonly();
  pinnedId = this.pinnedSignal.asReadonly();

  togglePin(id: string): void {
    if (this.pinnedSignal() === id) {
      this.pinnedSignal.set(null);
      localStorage.removeItem('pinnedControlId');
    } else {
      this.pinnedSignal.set(id);
      localStorage.setItem('pinnedControlId', id);
    }
  }

  loadControls(tipo?: string): void {
    if (this.loaded) return;
    const params = tipo && tipo !== 'ALL' ? `?tipo=${tipo}` : '';
    this.http.get<Control[]>(`${this.apiUrl}/controles${params}`).subscribe({
      next: (controles) => {
        this.loaded = true;
        this.controlsSignal.set(controles ?? []);
      },
      error: (err) => {
        console.error('Error cargando controles:', err);
        this.loaded = false;
      },
    });
  }

  reloadControls(tipo?: string): void {
    this.loaded = false;
    this.loadControls(tipo);
  }

  async createControl(titulo: string, descripcion: string, tipo: string, moneda: string): Promise<void> {
    await firstValueFrom(
      this.http.post(`${this.apiUrl}/controles`, { titulo, descripcion, tipo, moneda })
    );
  }

  loadGastos(controlId: string): void {
    this.http.get<any[]>(`${this.apiUrl}/controles/${controlId}/gastos`).subscribe({
      next: (gastos) => {
        this.gastosSignal.update(state => ({ ...state, [controlId]: gastos ?? [] }));
      },
      error: (err) => console.error('Error cargando gastos:', err),
    });
  }

  async createGasto(controlId: string, descripcion: string, monto: number): Promise<void> {
    await firstValueFrom(
      this.http.post(`${this.apiUrl}/controles/${controlId}/gastos`, {
        descripcion,
        monto: monto.toString(),
        fecha: new Date().toISOString().slice(0, 10),
      })
    );
    this.loadGastos(controlId);
  }

  private markDeleted(id: string): void {
    const next = new Set(this.deletedSignal());
    next.add(id);
    this.deletedSignal.set(next);
    localStorage.setItem('deletedControls', JSON.stringify([...next]));
    this.controlsSignal.update(list => list.filter(c => c.id !== id));
  }

  async deleteControl(id: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${this.apiUrl}/controles/${id}`)
    );
  }

  async invitar(controlId: string, usuarioId: string, rol: string): Promise<void> {
    await firstValueFrom(
      this.http.post(`${this.apiUrl}/controles/${controlId}/invitar`, { usuarioId, rol })
    );
  }

  async getControles(): Promise<Control[]> {
    return await firstValueFrom(
      this.http.get<Control[]>(`${this.apiUrl}/controles`)
    );
  }

  async cambiarEstado(id: string, estado: string): Promise<void> {
    await firstValueFrom(
      this.http.put(`${this.apiUrl}/controles/${id}/estado`, { estado })
    );
  }

  async salirControl(grupoId: string): Promise<void> {
    // find control id by group
    const control = this.controlsSignal().find(c => c.grupoId === grupoId);
    await firstValueFrom(
      this.http.delete(`${this.apiUrl}/grupos/${grupoId}/salir`)
    );
    if (control) this.markDeleted(control.id);
  }

  async updateControl(id: string, titulo: string, descripcion: string): Promise<void> {
    await firstValueFrom(
      this.http.put(`${this.apiUrl}/controles/${id}`, { titulo, descripcion })
    );
  }
}
