import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { firstValueFrom } from 'rxjs';
import { ChartConfiguration, ChartData } from 'chart.js';

@Injectable({ providedIn: 'root' })
export class ControlDetailService {
  private readonly http = inject(HttpClient);

  private get apiUrl(): string {
    return `${environment.apiUrl}/api/gastos`;
  }

  readonly control = signal<any | null>(null);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly users = signal<any[]>([]);
  readonly gastos = signal<any[]>([]);
  readonly members = signal<any[]>([]);
  readonly auditLogs = signal<any[]>([]);
  readonly summaryTotals = signal<Record<string, number>>({});
  readonly summaryNames = signal<Record<string, string>>({});
  readonly percentDraft = signal<Record<string, number>>({});

  readonly displayedGastos = computed(() => this.gastos());
  readonly totalGeneral = computed(() => this.gastos().reduce((sum, g) => sum + (Number(g.monto) || 0), 0));
  readonly sharedTotal = computed(() => this.gastos().filter(g => !g.usuarioId).reduce((sum, g) => sum + (Number(g.monto) || 0), 0));
  readonly percentSum = computed(() => this.members().reduce((s, m) => s + (Number(this.percentDraft()[m.id]) || 0), 0));
  readonly participantIds = computed(() => Object.keys(this.summaryTotals()));
  readonly editable = computed(() => this.control()?.estadoControl !== 'COMPLETADO');
  readonly percentRows = computed(() => this.participantIds().map(id => ({ id })));

  readonly barChartData = computed<ChartData<'bar'>>(() => {
    const labels = this.participantIds().map(id => this.summaryNames()[id] ?? id);
    const data = this.participantIds().map(id => this.summaryTotals()[id] ?? 0);
    return { labels, datasets: [{ data, label: 'Total', backgroundColor: '#3b82f6' }] };
  });

  readonly pieChartData = computed<ChartData<'pie'>>(() => {
    const labels = this.participantIds().map(id => this.summaryNames()[id] ?? id);
    const data = this.participantIds().map(id => this.summaryTotals()[id] ?? 0);
    return { labels, datasets: [{ data }] };
  });

  readonly barChartOptions: ChartConfiguration<'bar'>['options'] = { responsive: true, plugins: { legend: { display: false } } };
  readonly pieChartOptions: ChartConfiguration<'pie'>['options'] = { responsive: true };

  async load(controlId: string): Promise<void> {
    this.loading.set(true);
    try {
    const control = await firstValueFrom(this.http.get<any>(`${this.apiUrl}/controles/${controlId}`));
    this.control.set(control);
    const gastos = await firstValueFrom(this.http.get<any[]>(`${this.apiUrl}/controles/${controlId}/gastos`));
    this.gastos.set(gastos ?? []);

    const membersUsers = control?.grupoId
      ? await firstValueFrom(this.http.get<any[]>(`${this.apiUrl}/grupos/${control.grupoId}/miembros/usuarios`)).catch(() => [])
      : [];
    this.members.set((membersUsers ?? []).map((u: any) => ({
      id: u.id,
      name: `${u.nombres ?? ''} ${u.apellidos ?? ''}`.trim() || u.username,
      email: u.email ?? '',
      role: 'MIEMBRO',
    })));

    this.loading.set(false);

    try {
      const asignaciones = await firstValueFrom(this.http.get<any[]>(`${this.apiUrl}/controles/${controlId}/asignaciones`));
      const draft: Record<string, number> = {};
      if (asignaciones && asignaciones.length > 0) {
        for (const a of asignaciones) draft[a.usuarioId] = Number(a.porcentaje) || 0;
      }
      for (const m of this.members()) {
        draft[m.id] ??= 0;
      }
      this.percentDraft.set(draft);
    } catch {
      const n = this.members().length || 1;
      const draft: Record<string, number> = {};
      for (const m of this.members()) draft[m.id] = 100 / n;
      this.percentDraft.set(draft);
    }

    const resumen = await firstValueFrom(this.http.get<any>(`${this.apiUrl}/controles/${controlId}/resumen`)).catch(() => null);
    const totals: Record<string, number> = {};
    const names: Record<string, string> = {};
    for (const t of (resumen?.totales ?? [])) {
      totals[t.usuarioId] = Number(t.total) || 0;
      names[t.usuarioId] = t.nombre || t.usuarioId;
    }
    this.summaryTotals.set(totals);
    this.summaryNames.set(names);

    // Auditoría en segundo plano
    const audit = await firstValueFrom(this.http.get<any[]>(`${this.apiUrl}/controles/${controlId}/auditoria`)).catch(() => []);
    this.auditLogs.set(audit ?? []);
    } catch (err) {
      console.error('Error cargando detalle:', err);
      this.loading.set(false);
    }
  }

  isMember(userId: string | null): boolean {
    if (!userId) return false;
    return this.members().some(m => m.id === userId);
  }

  async deleteGasto(gastoId: string, controlId: string) {
    await firstValueFrom(this.http.delete(`${this.apiUrl}/controles/${controlId}/gastos/${gastoId}`));
    await this.load(controlId);
  }

  async moveGastos(destinoControlId: string, gastoIds: string[]) {
    await firstValueFrom(this.http.post(`${this.apiUrl}/controles/${destinoControlId}/gastos/mover`, { gastoIds }));
  }

  async updateGasto(gastoId: string, descripcion: string, monto: number, controlId: string) {
    await firstValueFrom(
      this.http.put(`${this.apiUrl}/controles/gastos/${gastoId}`, {
        descripcion,
        monto,
        fecha: null,
        usuarioId: null,
        asignaciones: null,
      })
    );
    await this.load(controlId);
  }

  async assignUser(gasto: any, usuarioId: string | null) {
    const val = usuarioId === 'shared' ? null : usuarioId;
    await firstValueFrom(
      this.http.put(`${this.apiUrl}/controles/gastos/${gasto.id}`, {
        descripcion: gasto.descripcion,
        monto: gasto.monto,
        fecha: gasto.fecha,
        usuarioId: val,
        asignaciones: null,
      })
    );
    // Actualizar solo el gasto localmente
    this.gastos.update(list => list.map(g => g.id === gasto.id ? { ...g, usuarioId: val } : g));
    // Si ya no hay gastos compartidos, poner porcentajes en 0 y guardar en BD
    const sharedTotal = this.gastos().filter(g => !g.usuarioId).reduce((s, g) => s + (Number(g.monto) || 0), 0);
    if (sharedTotal === 0) {
      const draft: Record<string, number> = {};
      for (const m of this.members()) draft[m.id] = 0;
      this.percentDraft.set(draft);
      await this.savePercentages(gasto.controlId);
    }
    // Recalcular totales sin recargar todo
    const resumen = await firstValueFrom(this.http.get<any>(`${this.apiUrl}/controles/${gasto.controlId}/resumen`)).catch(() => null);
    const totals: Record<string, number> = {};
    for (const t of (resumen?.totales ?? [])) totals[t.usuarioId] = Number(t.total) || 0;
    this.summaryTotals.set(totals);
  }

  updatePercent(userId: string, event: Event) {
    const input = event.target as HTMLInputElement;
    const num = Number(input.value);
    const draft = this.percentDraft();
    if (isNaN(num) || num < 0) {
      input.value = String(draft[userId] ?? 0);
      return;
    }
    const othersSum = Object.entries(draft)
      .filter(([k]) => k !== userId)
      .reduce((s, [, v]) => s + (Number(v) || 0), 0);
    if (othersSum + num > 100) {
      input.value = String(draft[userId] ?? 0);
      return;
    }
    this.percentDraft.update(d => ({ ...d, [userId]: num }));
  }

  async savePercentages(controlId: string) {
    this.saving.set(true);
    const draft = this.percentDraft();
    const asignaciones = Object.entries(draft).map(([usuarioId, porcentaje]) => ({ usuarioId, porcentaje: Number(porcentaje) || 0 }));
    try {
      await firstValueFrom(
        this.http.put(`${this.apiUrl}/controles/${controlId}`, {
          asignaciones,
        })
      );
      // Refrescar solo totales/auditoría, sin spinner global
      const resumen = await firstValueFrom(this.http.get<any>(`${this.apiUrl}/controles/${controlId}/resumen`)).catch(() => null);
      const totals: Record<string, number> = {};
      for (const t of (resumen?.totales ?? [])) totals[t.usuarioId] = Number(t.total) || 0;
      this.summaryTotals.set(totals);
      const audit = await firstValueFrom(this.http.get<any[]>(`${this.apiUrl}/controles/${controlId}/auditoria`)).catch(() => []);
      this.auditLogs.set(audit ?? []);
    } catch (err) {
      console.error('Error guardando asignaciones:', err);
    } finally {
      this.saving.set(false);
    }
  }
}
