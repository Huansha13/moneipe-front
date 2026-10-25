import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';
import { UsersService } from '../../../users/services/users.service';
import { GroupService } from '../../service/group.service';
import { AuthService } from '../../../../core/auth/auth.service';

export interface CreateGroupResult {
  title: string;
  description: string;
  memberIds: string[];
}

@Component({
  selector: 'app-create-group-dialog',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    TranslatePipe,
  ],
  templateUrl: './create-group-dialog.html',
  styleUrl: './create-group-dialog.scss',
})
export class CreateGroupDialog implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<CreateGroupDialog>);
  private readonly usersService = inject(UsersService);
  private readonly groupService = inject(GroupService);
  private readonly authService = inject(AuthService);

  saving = signal(false);
  loadingUsers = signal(true);
  users: Array<{ id: string; username: string; firstName: string; lastName: string }> = [];

  form = new FormGroup({
    title: new FormControl('', [Validators.required, Validators.minLength(2)]),
    description: new FormControl(''),
    members: new FormControl<string[]>([]),
  });

  async ngOnInit() {
    try {
      const keycloakUsers = await this.usersService.getUsers();
      const currentUserId = this.authService.profile().userId;
      this.users = keycloakUsers
        .filter(u => u.id !== currentUserId)
        .map(u => ({
          id: u.id,
          username: u.username,
          firstName: u.firstName,
          lastName: u.lastName,
        }));
    } catch {
      this.users = [];
    } finally {
      this.loadingUsers.set(false);
    }
  }

  cancel() {
    this.dialogRef.close();
  }

  async save() {
    if (this.form.invalid) return;

    this.saving.set(true);
    try {
      await this.groupService.crearGrupo(
        this.form.value.title!,
        this.form.value.description ?? '',
        this.form.value.members ?? []
      );

      this.dialogRef.close(true);
    } catch (error) {
      console.error('Error al crear el grupo:', error);
    } finally {
      this.saving.set(false);
    }
  }
}
