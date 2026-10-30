import { Component, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { TranslatePipe } from '@ngx-translate/core';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ControlService } from './service/control.service';
import { GroupService } from '../group/service/group.service';
import { MembersDialog, MembersDialogData } from '../group/components/members-dialog/members-dialog';
import { MatDialog } from '@angular/material/dialog';
import { CreateControlDialog } from './components/create-control-dialog/create-control-dialog';
import { ESTADO_CONTROL, ROL_GRUPO } from '../../shared/constants/app.constants';

@Component({
  selector: 'app-control',
  imports: [
    TranslatePipe,
    MatCardModule,
    MatTabsModule,
    MatTableModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatMenuModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './control.html',
  styleUrl: './control.scss',
})
export class Control {
  protected readonly ESTADO_CONTROL = ESTADO_CONTROL;
  protected readonly ROL_GRUPO = ROL_GRUPO;

  private readonly controlService = inject(ControlService);
  private readonly groupService = inject(GroupService);
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  controls = this.controlService.sortedControls;
  typeFilter = signal<string>('ALL');
  filteredControls = computed(() => {
    const type = this.typeFilter();
    const list = this.controls();
    if (type === 'ALL') return list;
    return list.filter(c => (c.tipo ?? 'GASTO') === type);
  });
  pinnedId = this.controlService.pinnedId;

  constructor() {
    effect(() => {
      const tipo = this.typeFilter();
      this.controlService.reloadControls(tipo);
    });
  }

  protected gastosFor(controlId: string) {
    const list = this.controlService.gastos()[controlId] ?? [];
    return [...list].sort((a, b) => String(b.fecha ?? '').localeCompare(String(a.fecha ?? '')));
  }

  protected controlsByEstado(estado: string) {
    return this.filteredControls().filter(c => (c.estadoControl ?? 'CREADO') === estado);
  }

  protected reload() {
    this.controlService.reloadControls(this.typeFilter());
  }

  protected togglePin(id: string) {
    this.controlService.togglePin(id);
  }

  protected async deleteControl(id: string) {
    const control = this.controlService.controls().find(c => c.id === id);
    if (control && control.estadoControl !== 'CREADO') return;
    await this.controlService.deleteControl(id);
    this.controlService.reloadControls(this.typeFilter());
  }

  protected async cambiarEstado(id: string, estado: string) {
    await this.controlService.cambiarEstado(id, estado);
    this.controlService.reloadControls(this.typeFilter());
  }

  protected openCreateControl() {
    const dialogRef = this.dialog.open(CreateControlDialog, {
      width: '480px',
      maxWidth: '95vw',
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.controlService.reloadControls(this.typeFilter());
      }
    });
  }

  protected async openMembers(groupId?: string | null) {
    if (!groupId) {
      console.warn('No hay grupo asociado a este control');
      return;
    }
    try {
      const usuarios = await this.groupService.getGroupMembersUsers(groupId);
      const members = (usuarios ?? []).map((u: any) => ({
        id: u.id,
        name: `${u.nombres ?? ''} ${u.apellidos ?? ''}`.trim() || u.username,
        email: u.email ?? '',
        role: 'MIEMBRO',
      }));
      const currentUserId = this.authService.profile().userId;
      const isAdmin = members.some(m => m.id === currentUserId && m.role === 'ADMIN');
      const group = { id: groupId, title: 'Miembros del grupo', description: '', role: isAdmin ? 'ADMIN' : 'MIEMBRO', members };
      const dialogRef = this.dialog.open(MembersDialog, {
        width: '480px',
        maxWidth: '95vw',
        data: { group } as MembersDialogData,
      });
      dialogRef.afterClosed().subscribe(() => {
        this.groupService.reloadGroups();
        this.controlService.reloadControls(this.typeFilter());
      });
    } catch (err) {
      console.error('Error cargando miembros:', err);
    }
  }

  protected openDetail(id: string) {
    this.router.navigate(['/controls', id]);
  }
}