import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { ControlService } from '../../service/control.service';
import { ControlDetailService } from '../../service/control-detail.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-move-gastos-dialog',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  templateUrl: './move-gastos-dialog.html',
  styleUrl: './move-gastos-dialog.scss',
})
export class MoveGastosDialog implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<MoveGastosDialog>);
  private readonly controlService = inject(ControlService);
  private readonly detailService = inject(ControlDetailService);
  private readonly dialogData = inject(MAT_DIALOG_DATA) as { currentControlId: string; selectedIds: string[] };

  get currentControlId(): string { return this.dialogData.currentControlId; }
  get selectedIds(): string[] { return this.dialogData.selectedIds; }

  saving = signal(false);
  controls = this.controlService.controls;

  form = new FormGroup({
    destinoControlId: new FormControl<string | null>(null, [Validators.required]),
  });

  ngOnInit(): void {
    this.controlService.loadControls();
  }

  get availableControls() {
    return (this.controls() ?? []).filter(c => c.id !== this.currentControlId);
  }

  cancel() {
    this.dialogRef.close();
  }

  async save() {
    if (this.form.invalid) return;
    const destino = this.form.value.destinoControlId!;
    this.saving.set(true);
    try {
      await this.detailService.moveGastos(destino, this.selectedIds);
      this.dialogRef.close(true);
    } catch (error) {
      console.error('Error al mover gastos:', error);
    } finally {
      this.saving.set(false);
    }
  }
}