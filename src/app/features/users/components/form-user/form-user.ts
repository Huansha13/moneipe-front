import {Component, inject, signal, OnInit} from '@angular/core';
import {ReactiveFormsModule, FormControl, FormGroup, Validators} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatDialogModule, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {UsersService} from '../../services/users.service';
import {PasswordValidatorService} from '../../../../shared/services/password-validator.service';

export interface UserDialogData {
  id?: string;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  enabled?: boolean;
  mode: 'create' | 'edit';
}

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
    MatSnackBarModule,
    TranslatePipe,
  ],
  templateUrl: './form-user.html',
  styleUrl: './form-user.scss',
})
export class FormUser implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<FormUser>);
  private readonly translate = inject(TranslateService);
  private readonly usersService = inject(UsersService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly passwordValidator = inject(PasswordValidatorService);
  readonly dialogData = inject<UserDialogData>(MAT_DIALOG_DATA);

  saving = signal(false);
  hidePassword = signal(true);

  form = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.minLength(3)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required),
    password: new FormControl(''),
    enabled: new FormControl(true),
  });

  get isEditMode(): boolean {
    return this.dialogData?.mode === 'edit';
  }

  ngOnInit() {
    if (this.isEditMode && this.dialogData) {
      this.form.patchValue({
        username: this.dialogData.username,
        email: this.dialogData.email,
        firstName: this.dialogData.firstName,
        lastName: this.dialogData.lastName,
        enabled: this.dialogData.enabled,
      });
      this.form.get('username')?.disable();
      this.form.get('password')?.clearValidators();
      this.form.get('password')?.updateValueAndValidity();
    } else {
      this.form.get('password')?.setValidators([Validators.required, this.passwordValidator.createValidator()]);
      this.form.get('password')?.updateValueAndValidity();
    }
  }

  cancel() {
    this.dialogRef.close();
  }

  async save() {
    if (this.form.invalid) return;

    this.saving.set(true);
    try {
      const raw = this.form.getRawValue();

      if (this.isEditMode) {
        await this.usersService.updateUser(this.dialogData.id!, {
          email: raw.email!,
          firstName: raw.firstName!,
          lastName: raw.lastName!,
          enabled: raw.enabled!,
        });

        this.snackBar.open(
          this.translate.instant('USERS.FORM.USER_UPDATED'),
          this.translate.instant('ACCOUNT.CLOSE'),
          {duration: 3000}
        );
      } else {
        await this.usersService.createUser({
          username: raw.username!,
          email: raw.email!,
          firstName: raw.firstName!,
          lastName: raw.lastName!,
          password: raw.password!,
          enabled: raw.enabled!,
        });

        this.snackBar.open(
          this.translate.instant('USERS.FORM.USER_CREATED'),
          this.translate.instant('ACCOUNT.CLOSE'),
          {duration: 3000}
        );
      }

      this.dialogRef.close(true);
    } catch (error) {
      console.error('Error al guardar el usuario:', error);
      this.snackBarError();
    } finally {
      this.saving.set(false);
    }
  }

  private snackBarError() {
    this.snackBar.open(
      this.translate.instant('USERS.FORM.USER_CREATE_ERROR'),
      this.translate.instant('ACCOUNT.CLOSE'),
      {duration: 3000}
    );
  }

  passwordValid(): boolean {
    return this.passwordValidator.isValid(this.form.get('password')?.value ?? '');
  }

  getPasswordHint(): string {
    return this.passwordValidator.getHint(this.form.get('password')?.value ?? '');
  }
}
