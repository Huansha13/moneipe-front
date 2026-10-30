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
import { ControlService } from '../../service/control.service';
import { UsersService } from '../../../users/services/users.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { GroupService } from '../../../group/service/group.service';


@Component({
  selector: 'app-create-control-dialog',
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
  templateUrl: './create-control-dialog.html',
  styleUrl: './create-control-dialog.scss',
})
export class CreateControlDialog implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<CreateControlDialog>);
  private readonly controlService = inject(ControlService);
  private readonly usersService = inject(UsersService);
  private readonly authService = inject(AuthService);
  private readonly groupService = inject(GroupService);


  saving = signal(false);
  loadingUsers = signal(true);
  users: Array<{ id: string; username: string; firstName: string; lastName: string }> = [];

  form = new FormGroup({
    titulo: new FormControl('', [Validators.required, Validators.minLength(2)]),
    descripcion: new FormControl(''),
    tipo: new FormControl('GASTO', [Validators.required]),
    moneda: new FormControl('PEN', [Validators.required]),
    inviteMembers: new FormControl<string[]>([]),
  });

  async ngOnInit() {
    try {
      const allUsers = await this.usersService.getUsers();
      const currentUserId = this.authService.profile().userId;
      this.users = allUsers
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
      // 1. Crear el control
      await this.controlService.createControl(
        this.form.value.titulo!,
        this.form.value.descripcion ?? '',
        this.form.value.tipo!,
        this.form.value.moneda!
      );

      // 2. Si se seleccionaron miembros, crear grupo e invitar
      const memberIds = this.form.value.inviteMembers ?? [];
      if (memberIds.length > 0) {
        // Obtener el control recién creado
        const controles = await this.controlService.getControles();
        const nuevoControl = controles.find(c => c.titulo === this.form.value.titulo);
        if (nuevoControl) {
          for (const uid of memberIds) {
            await this.controlService.invitar(nuevoControl.id, uid, 'MEMBER');
          }
        }
      }

      this.dialogRef.close(true);
    } catch (error) {
      console.error('Error al crear el control:', error);
    } finally {
      this.saving.set(false);
    }
  }
}
