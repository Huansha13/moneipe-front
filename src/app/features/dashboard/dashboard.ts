import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { DashboardService } from './dashboard.service';
import { ControlService } from '../control/service/control.service';
import { MatDialog } from '@angular/material/dialog';
import { CreateControlDialog } from '../control/components/create-control-dialog/create-control-dialog';

@Component({
  selector: 'app-dashboard',
  imports: [
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatSelectModule,
    MatTableModule,
    BaseChartDirective,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly controlService = inject(ControlService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  readonly resumen = this.dashboardService.resumen;
  readonly controles = this.dashboardService.controles;
  readonly grupos = this.dashboardService.grupos;
  readonly portafolios = this.dashboardService.portafolios;

  chartData = computed<ChartData<'line'>>(() => {
    const stats = this.dashboardService.monthlyStats();
    const labels = stats.map(s => s.mes);
    const data = stats.map(s => Number(s.total) || 0);
    return {
      labels,
      datasets: [{
        label: 'Total Gastado',
        data,
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
      }],
    };
  });

  chartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
  };

  ngOnInit(): void {
    this.dashboardService.load();
    this.dashboardService.loadStats();
    this.controlService.loadControls();
  }

  protected openCreateControl() {
    const dialogRef = this.dialog.open(CreateControlDialog, {
      width: '480px',
      maxWidth: '95vw',
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.controlService.reloadControls();
        this.dashboardService.load();
      }
    });
  }

  protected openDetail(id: string) {
    this.router.navigate(['/controls', id]);
  }
}
