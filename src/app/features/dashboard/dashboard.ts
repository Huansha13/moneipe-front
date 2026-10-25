import { Component, inject, OnInit } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { DashboardService } from './dashboard.service';

@Component({
  selector: 'app-dashboard',
  imports: [
    TranslatePipe,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatChipsModule,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private readonly dashboardService = inject(DashboardService);

  readonly resumen = this.dashboardService.resumen;
  readonly controles = this.dashboardService.controles;
  readonly grupos = this.dashboardService.grupos;
  readonly portafolios = this.dashboardService.portafolios;

  ngOnInit(): void {
    this.dashboardService.load();
  }
}
