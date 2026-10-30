import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { ControlService } from '../../service/control.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-create-gasto-dialog',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  templateUrl: './create-gasto-dialog.html',
  styleUrl: './create-gasto-dialog.scss',
})
export class CreateGastoDialog {
  private readonly dialogRef = inject(MatDialogRef<CreateGastoDialog>);
  private readonly controlService = inject(ControlService);
  private readonly dialogData = inject(MAT_DIALOG_DATA) as { controlId: string };

  get controlId(): string { return this.dialogData.controlId; }

  saving = signal(false);

  form = new FormGroup({
    descripcion: new FormControl(''),
    monto: new FormControl<number | null>(null, [Validators.required, Validators.min(0.01)]),
  });

  cancel() {
    this.dialogRef.close();
  }

  async save() {
    if (this.form.invalid) return;
    this.saving.set(true);
    try {
      await this.controlService.createGasto(
        this.controlId,
        this.form.value.descripcion ?? '',
        Number(this.form.value.monto)
      );
      this.dialogRef.close(true);
    } catch (error) {
      console.error('Error al crear gasto:', error);
    } finally {
      this.saving.set(false);
    }
  }
}