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
  selector: 'app-edit-control-dialog',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  templateUrl: './edit-control-dialog.html',
  styleUrl: './edit-control-dialog.scss',
})
export class EditControlDialog {
  private readonly dialogRef = inject(MatDialogRef<EditControlDialog>);
  private readonly controlService = inject(ControlService);
  private readonly dialogData = inject(MAT_DIALOG_DATA) as { controlId: string; titulo: string; descripcion: string };

  saving = signal(false);

  form = new FormGroup({
    titulo: new FormControl(this.dialogData.titulo ?? '', [Validators.required]),
    descripcion: new FormControl(this.dialogData.descripcion ?? ''),
  });

  cancel() {
    this.dialogRef.close();
  }

  async save() {
    if (this.form.invalid) return;
    this.saving.set(true);
    try {
      await this.controlService.updateControl(
        this.dialogData.controlId,
        this.form.value.titulo ?? '',
        this.form.value.descripcion ?? ''
      );
      this.dialogRef.close(true);
    } catch (error) {
      console.error('Error al actualizar control:', error);
    } finally {
      this.saving.set(false);
    }
  }
}