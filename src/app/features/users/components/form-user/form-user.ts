import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-form-user',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatDialogModule,
    TranslatePipe,
  ],
  templateUrl: './form-user.html',
  styleUrl: './form-user.scss',
})
export class FormUser {
  private readonly dialogRef = inject(MatDialogRef<FormUser>);
  private readonly translate = inject(TranslateService);

  saving = signal(false);
  hidePassword = signal(true);

  form = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.minLength(3)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required),
    password: new FormControl('', [Validators.required, this.passwordValidator]),
    enabled: new FormControl(true),
  });

  cancel() {
    this.dialogRef.close();
  }

  save() {
    if (this.form.invalid) return;
    this.dialogRef.close(this.form.getRawValue());
  }

  hasUpperCase(): boolean {
    const value = this.form.get('password')?.value;
    return value ? /[A-Z]/.test(value) : false;
  }

  hasLowerCase(): boolean {
    const value = this.form.get('password')?.value;
    return value ? /[a-z]/.test(value) : false;
  }

  hasSpecialChar(): boolean {
    const value = this.form.get('password')?.value;
    return value ? /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value) : false;
  }

  passwordValid(): boolean {
    return this.hasUpperCase() && this.hasLowerCase() && this.hasSpecialChar() &&
           (this.form.get('password')?.value?.length ?? 0) >= 8;
  }

  getPasswordHint(): string {
    const hints: string[] = [];
    const value = this.form.get('password')?.value ?? '';

    if (value.length < 8) {
      hints.push(this.translate.instant('USERS.FORM.PASSWORD_MIN_LENGTH'));
    }
    if (!this.hasUpperCase()) {
      hints.push(this.translate.instant('USERS.FORM.PASSWORD_UPPERCASE'));
    }
    if (!this.hasLowerCase()) {
      hints.push(this.translate.instant('USERS.FORM.PASSWORD_LOWERCASE'));
    }
    if (!this.hasSpecialChar()) {
      hints.push(this.translate.instant('USERS.FORM.PASSWORD_SPECIAL_CHAR'));
    }

    return hints.join(', ');
  }

  private passwordValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const hasMinLength = value.length >= 8;
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);

    const valid = hasMinLength && hasUpperCase && hasLowerCase && hasSpecialChar;

    return valid ? null : {
      passwordStrength: {
        hasMinLength,
        hasUpperCase,
        hasLowerCase,
        hasSpecialChar,
      }
    };
  }
}
