import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import {DatePipe, DecimalPipe} from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { CreateGastoDialog } from './components/create-gasto-dialog/create-gasto-dialog';
import { ControlDetailService } from './service/control-detail.service';

@Component({
  selector: 'app-control-detail',
  imports: [
    DecimalPipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatDividerModule,
    MatTableModule,
    MatSelectModule,
    MatInputModule,
    MatProgressSpinnerModule,
    BaseChartDirective,
    DatePipe,
  ],
  templateUrl: './control-detail.html',
  styleUrl: './control-detail.scss',
})
export class ControlDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly authService = inject(AuthService);
  readonly svc = inject(ControlDetailService);

  get currentUserId() { return this.authService.profile().userId; }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    void this.svc.load(id);
  }

  get control() { return this.svc.control; }
  get loading() { return this.svc.loading; }
  get saving() { return this.svc.saving; }
  get gastos() { return this.svc.gastos; }
  get members() { return this.svc.members; }
  get auditLogs() { return this.svc.auditLogs; }
  get summaryTotals() { return this.svc.summaryTotals; }
  get summaryNames() { return this.svc.summaryNames; }
  get percentDraft() { return this.svc.percentDraft; }
  get visibleCount() { return this.svc.visibleCount; }
  get displayedGastos() { return this.svc.displayedGastos; }
  get hasMore() { return this.svc.hasMore; }
  get totalGeneral() { return this.svc.totalGeneral; }
  get sharedTotal() { return this.svc.sharedTotal; }
  get percentSum() { return this.svc.percentSum; }
  get participantIds() { return this.svc.participantIds; }
  get barChartData() { return this.svc.barChartData; }
  get pieChartData() { return this.svc.pieChartData; }
  get barChartOptions() { return this.svc.barChartOptions; }
  get pieChartOptions() { return this.svc.pieChartOptions; }
  get percentRows() { return this.svc.percentRows; }
  get editable() { return this.svc.editable(); }

  isMember(userId: string | null): boolean { return this.svc.isMember(userId); }
  onScroll(event: Event) { this.svc.visibleCount.update(v => Math.min(v + 10, this.svc.gastos().length)); }
  assignUser(gasto: any, usuarioId: string | null) { void this.svc.assignUser(gasto, usuarioId); }
  deleteGasto(gastoId: string) { void this.svc.deleteGasto(gastoId, this.route.snapshot.paramMap.get('id') ?? ''); }
  updateGasto(gastoId: string, descripcion: string, monto: number) { void this.svc.updateGasto(gastoId, descripcion, monto, this.route.snapshot.paramMap.get('id') ?? ''); }
  updatePercent(userId: string, event: Event) { this.svc.updatePercent(userId, event); }
  savePercentages() { void this.svc.savePercentages(this.route.snapshot.paramMap.get('id') ?? ''); }
  openCreateGasto(controlId: string | null) {
    if (!controlId) return;
    const dialogRef = this.dialog.open(CreateGastoDialog, { width: '480px', maxWidth: '95vw', disableClose: true, data: { controlId } });
    dialogRef.afterClosed().subscribe((result) => { if (result) void this.svc.load(controlId); });
  }
  goBack() { this.router.navigate(['/controls']); }
}
