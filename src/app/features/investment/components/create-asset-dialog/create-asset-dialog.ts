import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';
import { InvestmentService } from '../../service/investment.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-create-asset-dialog',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    TranslatePipe,
  ],
  templateUrl: './create-asset-dialog.html',
  styleUrl: './create-asset-dialog.scss',
})
export class CreateAssetDialog {
  private readonly dialogRef = inject(MatDialogRef<CreateAssetDialog>);
  private readonly investmentService = inject(InvestmentService);
  private readonly dialogData = inject(MAT_DIALOG_DATA) as { portfolioId: string };

  get portfolioId(): string { return this.dialogData.portfolioId; }

  saving = signal(false);

  form = new FormGroup({
    nombre: new FormControl('', [Validators.required]),
    descripcion: new FormControl(''),
    monto: new FormControl(0, [Validators.required, Validators.min(0)]),
  });

  cancel() {
    this.dialogRef.close();
  }

  async save() {
    if (this.form.invalid) return;

    this.saving.set(true);
    try {
      const v = this.form.getRawValue();
      await this.investmentService.createAsset(
        this.portfolioId,
        v.nombre!,
        v.descripcion ?? '',
        v.monto!
      );
      this.dialogRef.close(true);
    } catch (error) {
      console.error('Error al crear el registro:', error);
    } finally {
      this.saving.set(false);
    }
  }
}