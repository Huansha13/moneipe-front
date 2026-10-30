import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { InitialsPipe } from '../../../../shared/pipes/initials.pipe';
import { UsersService } from '../../../users/services/users.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { GroupService } from '../../service/group.service';
import Keycloak from 'keycloak-js';
import { firstValueFrom } from 'rxjs';

export interface MembersDialogData {
  group: {
    id: string;
    title: string;
    description?: string;
    role: 'ADMIN' | 'MIEMBRO';
    members: Array<{ id: string; name: string; email: string; role: 'ADMIN' | 'MIEMBRO' }>;
  };
}

@Component({
  selector: 'app-members-dialog',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatListModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatIconModule,
    TranslatePipe,
    InitialsPipe,
  ],
  templateUrl: './members-dialog.html',
  styleUrl: './members-dialog.scss',
})
export class MembersDialog implements OnInit {
  protected readonly dialogRef = inject(MatDialogRef<MembersDialog>);
  protected readonly data = inject<MembersDialogData>(MAT_DIALOG_DATA);
  private readonly usersService = inject(UsersService);
  private readonly authService = inject(AuthService);
  private readonly keycloak = inject(Keycloak);
  private readonly groupService = inject(GroupService);

  get currentUserId(): string {
    return this.keycloak.subject ?? this.authService.profile().userId;
  }

  readonly members = signal(this.data.group.members ?? []);
  readonly displayedMembers = computed(() => this.members().filter(m => m.id !== this.currentUserId));
  readonly users = signal<any[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);

  readonly selectedUserId = new FormControl<string | null>(null);

  readonly availableUsers = computed(() => {
    const memberIds = new Set(this.members().map(m => m.id));
    return this.users().filter(u => !memberIds.has(u.id));
  });

  async ngOnInit() {
    try {
      const usuarios = await this.usersService.getUsers();
      const currentUserId = this.currentUserId;
      this.users.set(
        (usuarios ?? [])
          .filter(u => u.id !== currentUserId)
          .map(u => ({
            id: u.id,
            username: u.username,
            firstName: u.firstName,
            lastName: u.lastName,
            email: u.email,
          }))
      );
    } catch (err) {
      console.error('Error cargando usuarios:', err);
    } finally {
      this.loading.set(false);
    }
  }

  async addMember() {
    const userId = this.selectedUserId.value;
    if (!userId) return;
    this.saving.set(true);
    try {
      await this.groupService.addMember(this.data.group.id, userId, 'MEMBER');
      const u = this.users().find(x => x.id === userId);
      this.members.update(list => [
        ...list,
        {
          id: userId,
          name: u ? (`${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.username) : userId,
          email: u?.email ?? '',
          role: 'MIEMBRO',
        },
      ]);
      this.selectedUserId.setValue(null);
    } catch (err) {
      console.error('Error agregando miembro:', err);
    } finally {
      this.saving.set(false);
    }
  }

  async removeMember(memberId: string) {
    console.log('removeMember called', memberId);
    this.saving.set(true);
    try {
      await this.groupService.removeMember(this.data.group.id, memberId);
      this.members.update(list => list.filter(m => m.id !== memberId));
    } catch (err) {
      console.error('Error eliminando miembro:', err);
    } finally {
      this.saving.set(false);
    }
  }

  async leaveGroup() {
    try {
      await this.removeMember(this.currentUserId);
    } catch (err) {
      console.error('Error al salir del grupo:', err);
    } finally {
      this.dialogRef.close();
    }
  }
}