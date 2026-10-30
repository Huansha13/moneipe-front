import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { firstValueFrom } from 'rxjs';
import { Portfolio } from '../models/portfolio.model';

export interface Activo {
  id: string;
  portafolioId: string;
  tipo: string;
  simbodo: string;
  nombre: string;
  cantidad: number;
  precioCompra: number;
  fechaCompra: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class InvestmentService {
  private readonly http = inject(HttpClient);

  private get apiUrl(): string {
    return `${environment.apiUrl}/api/inversiones`;
  }

  private readonly portfoliosSignal = signal<Portfolio[]>([]);
  private readonly activosMap = signal<Map<string, Activo[]>>(new Map());
  private loaded = false;

  portfolios = this.portfoliosSignal.asReadonly();
  portfolioCount = computed(() => this.portfoliosSignal().length);

  activosFor(portfolioId: string): Activo[] {
    return this.activosMap().get(portfolioId) ?? [];
  }

  loadPortfolios(): void {
    if (this.loaded) return;
    this.http.get<Portfolio[]>(`${this.apiUrl}/portafolios`).subscribe({
      next: (portafolios) => {
        this.loaded = true;
        this.portfoliosSignal.set(portafolios ?? []);
        // Load activos for each portfolio
        (portafolios ?? []).forEach(pf => this.loadActivos(pf.id));
      },
      error: (err) => {
        console.error('Error cargando portafolios:', err);
        this.loaded = false;
      },
    });
  }

  reloadPortfolios(): void {
    this.loaded = false;
    this.loadPortfolios();
  }

  private loadActivos(portfolioId: string): void {
    this.http.get<Activo[]>(`${this.apiUrl}/activos/portafolio/${portfolioId}`).subscribe({
      next: (activos) => {
        this.activosMap.update(m => {
          const newMap = new Map(m);
          newMap.set(portfolioId, activos ?? []);
          return newMap;
        });
      },
      error: (err) => console.error('Error cargando activos:', err),
    });
  }

  async createPortfolio(nombre: string, descripcion: string, moneda: string, grupoId?: string): Promise<void> {
    await firstValueFrom(
      this.http.post(`${this.apiUrl}/portafolios`, { nombre, descripcion, moneda, grupoId })
    );
  }

  async deletePortfolio(id: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${this.apiUrl}/portafolios/${id}`)
    );
  }

  async createAsset(portfolioId: string, nombre: string, descripcion: string, monto: number): Promise<void> {
    await firstValueFrom(
      this.http.post(`${this.apiUrl}/activos`, {
        portafolioId: portfolioId,
        tipo: 'GASTO',
        simbodo: descripcion || '-',
        nombre,
        cantidad: monto,
        precioCompra: 1,
        fechaCompra: null,
      })
    );
  }
}
