import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';
import { DashboardResumen } from './models/dashboard.model';
import { ControlResponse, GrupoResponse, PortafolioResponse } from './models/dashboard-response.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly http = inject(HttpClient);

  private get gastosUrl(): string {
    return `${environment.apiUrl}/api/gastos`;
  }

  private get inversionesUrl(): string {
    return `${environment.apiUrl}/api/inversiones`;
  }

  private readonly controlesSignal = signal<ControlResponse[]>([]);
  private readonly gruposSignal = signal<GrupoResponse[]>([]);
  private readonly portafoliosSignal = signal<PortafolioResponse[]>([]);
  private readonly loadingSignal = signal(false);
  private readonly monthlyStatsSignal = signal<{ mes: string; total: number }[]>([]);

  readonly controles = this.controlesSignal.asReadonly();
  readonly grupos = this.gruposSignal.asReadonly();
  readonly portafolios = this.portafoliosSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly monthlyStats = this.monthlyStatsSignal.asReadonly();

  readonly resumen = computed<DashboardResumen>(() => ({
    controlesCount: this.controlesSignal().length,
    gruposCount: this.gruposSignal().length,
    portafoliosCount: this.portafoliosSignal().length,
    loading: this.loadingSignal(),
  }));

  load(): void {
    // Cargar en paralelo sin bloquear la UI; cada sección se actualiza al llegar su dato
    firstValueFrom(this.http.get<ControlResponse[]>(`${this.gastosUrl}/controles`))
      .then(data => this.controlesSignal.set(data ?? []))
      .catch(() => this.controlesSignal.set([]));

    firstValueFrom(this.http.get<GrupoResponse[]>(`${this.gastosUrl}/grupos`))
      .then(data => this.gruposSignal.set(data ?? []))
      .catch(() => this.gruposSignal.set([]));

    firstValueFrom(this.http.get<PortafolioResponse[]>(`${this.inversionesUrl}/portafolios`))
      .then(data => this.portafoliosSignal.set(data ?? []))
      .catch(() => this.portafoliosSignal.set([]));
  }

  loadStats(): void {
    firstValueFrom(this.http.get<{ mes: string; total: number }[]>(`${this.gastosUrl}/estadisticas/mensual`))
      .then(data => this.monthlyStatsSignal.set(data ?? []))
      .catch(() => this.monthlyStatsSignal.set([]));
  }
}
