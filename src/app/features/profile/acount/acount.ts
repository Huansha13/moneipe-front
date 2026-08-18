import { Component, inject, signal, effect, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-acount',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatSnackBarModule,
  ],
  templateUrl: './acount.html',
  styleUrl: './acount.scss',
})
export class Acount implements OnInit {
  authService = inject(AuthService);
  private readonly snackBar = inject(MatSnackBar);

  editing = signal(false);
  saving = signal(false);

  private readonly _editingEffect = effect(() => {
    const editing = this.editing();
    const controls = Object.values(this.form.controls);
    editing ? controls.forEach(c => c.enable()) : controls.forEach(c => c.disable());
  });

  form = new FormGroup({
    firstName: new FormControl({ value: '', disabled: true }, Validators.required),
    lastName: new FormControl({ value: '', disabled: true }, Validators.required),
    email: new FormControl({ value: '', disabled: true }, [Validators.required, Validators.email]),
  });

  ngOnInit() {
    this.loadFormValues();
  }

  private loadFormValues() {
    this.form.patchValue({
      firstName: this.authService.profile().firstName,
      lastName: this.authService.profile().lastName,
      email: this.authService.profile().email,
    });
  }

  cancel() {
    this.loadFormValues();
    this.editing.set(false);
  }

  async save() {
    if (this.form.invalid) return;

    this.saving.set(true);
    try {
      const raw = this.form.getRawValue();
      await this.authService.updateProfile(raw as { firstName: string; lastName: string; email: string });
      this.editing.set(false);
      this.snackBar.open('Perfil actualizado', 'Cerrar', { duration: 3000 });
    } catch {
      this.snackBar.open('Error al actualizar el perfil', 'Cerrar', { duration: 3000 });
    } finally {
      this.saving.set(false);
    }
  }
}
