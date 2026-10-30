import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import {DatePipe, DecimalPipe} from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { CreateGastoDialog } from './components/create-gasto-dialog/create-gasto-dialog';
import { MoveGastosDialog } from './components/move-gastos-dialog/move-gastos-dialog';
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
    MatCheckboxModule,
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

  readonly selectedIds = signal<Set<string>>(new Set());

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
  get displayedGastos() { return this.svc.displayedGastos; }
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

  get allSelected(): boolean {
    const gastos = this.svc.gastos();
    return gastos.length > 0 && gastos.every(g => this.selectedIds().has(g.id));
  }
  get someSelected(): boolean {
    return this.selectedIds().size > 0 && !this.allSelected;
  }

  toggleAll(checked: boolean) {
    if (checked) {
      this.selectedIds.set(new Set(this.svc.gastos().map(g => g.id)));
    } else {
      this.selectedIds.set(new Set());
    }
  }
  toggleSelection(id: string, checked: boolean) {
    const next = new Set(this.selectedIds());
    if (checked) next.add(id); else next.delete(id);
    this.selectedIds.set(next);
  }

  downloadReport() {
    const control = this.svc.control();
    const moneda = control?.moneda ?? '';
    const gastos = this.svc.gastos();
    const totals = this.svc.summaryTotals();
    const names = this.svc.summaryNames();
    const sharedTotal = this.svc.sharedTotal();
    const percentDraft = this.svc.percentDraft();
    const members = this.svc.members();

    const totalGeneral = gastos.reduce((sum, g) => sum + (Number(g.monto) || 0), 0);

    // Agrupar gastos por usuario
    const groups = new Map<string, any[]>();
    for (const g of gastos) {
      const key = g.usuarioId ? String(g.usuarioId) : 'shared';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(g);
    }
    const gastosBody: any[] = [];
    for (const [userId, list] of groups) {
      const name = userId === 'shared'
        ? 'Gasto compartido'
        : (names[userId] || members.find(m => m.id === userId)?.name || userId);
      gastosBody.push([{ content: name, colSpan: 2, styles: { fontStyle: 'bold', fillColor: [230, 230, 230] } }]);
      for (const g of list) {
        gastosBody.push([g.descripcion ?? '', `${Number(g.monto || 0).toFixed(2)} ${moneda}`]);
      }
      const subtotal = list.reduce((sum, g) => sum + (Number(g.monto) || 0), 0);
      gastosBody.push([
        { content: 'Subtotal', styles: { fontStyle: 'bold' } },
        { content: `${subtotal.toFixed(2)} ${moneda}`, styles: { fontStyle: 'bold', halign: 'right' } },
      ]);
    }
    if (gastosBody.length === 0) {
      gastosBody.push([{ content: 'Sin gastos registrados', colSpan: 2 }]);
    }

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Reporte de gastos', 14, 20);
    doc.setFontSize(10);
    doc.text(`Control: ${control?.titulo ?? ''}`, 14, 28);
    doc.text(`Moneda: ${moneda}`, 14, 34);
    doc.text(`Generado: ${new Date().toLocaleString()}`, 14, 40);

    let y = 48;
    doc.setFontSize(12);
    doc.text('Lista de gastos', 14, y);
    y += 4;
    autoTable(doc, {
      startY: y,
      head: [['Descripción', 'Monto']],
      body: gastosBody,
      foot: [['Total general', `${totalGeneral.toFixed(2)} ${moneda}`]],
      styles: { fontSize: 9 },
    });
    y = (doc as any).lastAutoTable.finalY + 10;

    doc.setFontSize(12);
    doc.text('Totales por usuario', 14, y);
    y += 4;
    const totalsBody = Object.keys(totals).map(id => {
      const name = names[id] || members.find(m => m.id === id)?.name || id;
      return [name, `${Number(totals[id] || 0).toFixed(2)} ${moneda}`];
    });
    autoTable(doc, {
      startY: y,
      head: [['Usuario', 'Total']],
      body: totalsBody.length ? totalsBody : [['Sin datos', '']],
      styles: { fontSize: 9 },
    });
    y = (doc as any).lastAutoTable.finalY + 10;

    if (sharedTotal > 0) {
      doc.setFontSize(12);
      doc.text('Porcentajes compartidos', 14, y);
      y += 4;
      doc.setFontSize(9);
      doc.text(`Total compartido: ${sharedTotal.toFixed(2)} ${moneda}`, 14, y);
      y += 6;
      const sharedBody = Object.keys(percentDraft).map(id => {
        const name = names[id] || members.find(m => m.id === id)?.name || id;
        return [name, `${Number(percentDraft[id] || 0).toFixed(2)}%`];
      });
      autoTable(doc, {
        startY: y,
        head: [['Usuario', 'Porcentaje']],
        body: sharedBody.length ? sharedBody : [['Sin datos', '']],
        styles: { fontSize: 9 },
      });
    }

    const safeName = (control?.titulo ?? 'control').replace(/[^a-zA-Z0-9-_ ]/g, '').trim().replace(/\\s+/g, '-');
    doc.save(`reporte-${safeName || 'control'}.pdf`);
  }

  openMoveGastos() {
    const controlId = this.route.snapshot.paramMap.get('id') ?? '';
    if (!controlId || this.selectedIds().size === 0) return;
    const dialogRef = this.dialog.open(MoveGastosDialog, {
      width: '480px', maxWidth: '95vw', disableClose: true,
      data: { currentControlId: controlId, selectedIds: [...this.selectedIds()] },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.selectedIds.set(new Set());
        void this.svc.load(controlId);
      }
    });
  }

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
