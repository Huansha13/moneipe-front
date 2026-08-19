import { Injectable, inject } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class PasswordValidatorService {
  private readonly translate = inject(TranslateService);

  hasUpperCase(value: string): boolean {
    return value ? /[A-Z]/.test(value) : false;
  }

  hasLowerCase(value: string): boolean {
    return value ? /[a-z]/.test(value) : false;
  }

  hasSpecialChar(value: string): boolean {
    return value ? /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value) : false;
  }

  isValid(value: string): boolean {
    return this.hasUpperCase(value) &&
           this.hasLowerCase(value) &&
           this.hasSpecialChar(value) &&
           value.length >= 8;
  }

  getHint(value: string): string {
    const hints: string[] = [];

    if (value.length < 8) {
      hints.push(this.translate.instant('USERS.FORM.PASSWORD_MIN_LENGTH'));
    }
    if (!this.hasUpperCase(value)) {
      hints.push(this.translate.instant('USERS.FORM.PASSWORD_UPPERCASE'));
    }
    if (!this.hasLowerCase(value)) {
      hints.push(this.translate.instant('USERS.FORM.PASSWORD_LOWERCASE'));
    }
    if (!this.hasSpecialChar(value)) {
      hints.push(this.translate.instant('USERS.FORM.PASSWORD_SPECIAL_CHAR'));
    }

    return hints.join(', ');
  }

  createValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      return this.isValid(value) ? null : { passwordStrength: true };
    };
  }

  createMatchValidator(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const newPassword = group.get('newPassword')?.value;
      const confirmPassword = group.get('confirmPassword')?.value;

      if (newPassword && confirmPassword && newPassword !== confirmPassword) {
        group.get('confirmPassword')?.setErrors({ passwordMismatch: true });
        return { passwordMismatch: true };
      }

      return null;
    };
  }
}
