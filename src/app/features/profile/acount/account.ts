import { Component, inject, signal, effect, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../../core/auth/auth.service';
import { ChangePasswordDialog } from '../components/change-password/change-password';
import {MatTooltip} from '@angular/material/tooltip';

@Component({
  selector: 'app-account',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatDialogModule,
    MatSnackBarModule,
    TranslatePipe,
    MatTooltip,
  ],
  templateUrl: './account.html',
  styleUrl: './account.scss',
})
export class Account implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  editing = signal(false);
  saving = signal(false);

  get initials(): string {
    return this.authService.profile().initials;
  }

  get fullName(): string {
    return this.authService.profile().fullName;
  }

  get userId(): string {
    return this.authService.profile().userId;
  }

  get username(): string {
    return this.authService.profile().username;
  }

  get email(): string {
    return this.authService.profile().email;
  }

  get emailVerified(): boolean {
    return this.authService.profile().emailVerified;
  }

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

  openChangePassword() {
    this.dialog.open(ChangePasswordDialog, {
      width: '450px',
      disableClose: true,
    });
  }

  async save() {
    if (this.form.invalid) return;

    this.saving.set(true);
    try {
      const raw = this.form.getRawValue();
      await this.authService.updateProfile(raw as { firstName: string; lastName: string; email: string });
      this.editing.set(false);
      this.snackBar.open(
        this.translate.instant('ACCOUNT.PROFILE_UPDATED'),
        this.translate.instant('ACCOUNT.CLOSE'),
        { duration: 3000 }
      );
    } catch {
      this.snackBar.open(
        this.translate.instant('ACCOUNT.PROFILE_UPDATE_ERROR'),
        this.translate.instant('ACCOUNT.CLOSE'),
        { duration: 3000 }
      );
    } finally {
      this.saving.set(false);
    }
  }
}
