import {Component, inject, OnInit, signal} from '@angular/core';
import {ReactiveFormsModule, FormControl, FormGroup, Validators} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {TranslateService, TranslatePipe} from '@ngx-translate/core';
import {AuthService} from '../../../../core/auth/auth.service';
import {PasswordValidatorService} from '../../../../shared/services/password-validator.service';

@Component({
  selector: 'app-change-password-dialog',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    TranslatePipe,
  ],
  templateUrl: './change-password.html',
  styleUrl: './change-password.scss',
})
export class ChangePasswordDialog implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<ChangePasswordDialog>);
  private readonly authService = inject(AuthService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);
  private readonly passwordValidator = inject(PasswordValidatorService);

  saving = signal(false);
  hideCurrent = signal(true);
  hideNew = signal(true);
  hideConfirm = signal(true);

  form!: FormGroup;

  get passwordHint(): string {
    return this.passwordValidator.getHint(this.form.get('newPassword')?.value ?? '');
  }

  ngOnInit() {
    this.form = new FormGroup({
      currentPassword: new FormControl('', Validators.required),
      newPassword: new FormControl('', [Validators.required, this.passwordValidator.createValidator()]),
      confirmPassword: new FormControl('', [Validators.required]),
    }, {
      validators: this.passwordValidator.createMatchValidator()
    });
  }

  cancel() {
    this.dialogRef.close();
  }

  async save() {
    if (this.form.invalid) return;

    this.saving.set(true);
    try {
      const {currentPassword, newPassword} = this.form.getRawValue();
      await this.authService.changePassword(currentPassword!, newPassword!);

      this.snackBar.open(
        this.translate.instant('ACCOUNT.PASSWORD_CHANGED'),
        this.translate.instant('ACCOUNT.CLOSE'),
        {duration: 3000}
      );

      this.dialogRef.close(true);
    } catch {
      this.snackBar.open(
        this.translate.instant('ACCOUNT.PASSWORD_CHANGE_ERROR'),
        this.translate.instant('ACCOUNT.CLOSE'),
        {duration: 3000}
      );
    } finally {
      this.saving.set(false);
    }
  }

  passwordValid(): boolean {
    return this.passwordValidator.isValid(this.form.get('newPassword')?.value ?? '');
  }
}
