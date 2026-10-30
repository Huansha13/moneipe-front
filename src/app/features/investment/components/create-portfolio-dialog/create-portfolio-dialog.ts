import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';
import { InvestmentService } from '../../service/investment.service';
import { GroupService } from '../../../group/service/group.service';

@Component({
  selector: 'app-create-portfolio-dialog',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    TranslatePipe,
  ],
  templateUrl: './create-portfolio-dialog.html',
  styleUrl: './create-portfolio-dialog.scss',
})
export class CreatePortfolioDialog {
  private readonly dialogRef = inject(MatDialogRef<CreatePortfolioDialog>);
  private readonly investmentService = inject(InvestmentService);
  private readonly groupService = inject(GroupService);

  readonly groups = this.groupService.groups;

  saving = signal(false);

  form = new FormGroup({
    nombre: new FormControl('', [Validators.required, Validators.minLength(2)]),
    descripcion: new FormControl(''),
    moneda: new FormControl('PEN', [Validators.required]),
    grupoId: new FormControl<string | null>(null),
  });

  constructor() {
    this.groupService.loadGroups();
  }

  cancel() {
    this.dialogRef.close();
  }

  async save() {
    if (this.form.invalid) return;

    this.saving.set(true);
    try {
      await this.investmentService.createPortfolio(
        this.form.value.nombre!,
        this.form.value.descripcion ?? '',
        this.form.value.moneda!,
        this.form.value.grupoId ?? undefined
      );
      this.dialogRef.close(true);
    } catch (error) {
      console.error('Error al crear el portafolio:', error);
    } finally {
      this.saving.set(false);
    }
  }
}
