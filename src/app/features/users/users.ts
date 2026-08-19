import { Component, inject, OnInit, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { FormUser, UserDialogData } from './components/form-user/form-user';
import { UsersService } from './services/users.service';
import { ConfirmDialog, ConfirmDialogData } from '../../shared/components/confirm-dialog/confirm-dialog';
import {LoadingInformationComponent} from '../../shared/components/loading/loading-information';

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  enabled: boolean;
}

@Component({
  selector: 'app-users',
  imports: [
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatSnackBarModule,
    TranslatePipe,
    LoadingInformationComponent,
  ],
  templateUrl: './users.html',
  styleUrl: './users.scss'
})
export class Users implements OnInit {
  private readonly dialog = inject(MatDialog);
  private readonly usersService = inject(UsersService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  users = signal<User[]>([]);
  loading = signal(false);
  displayedColumns = ['username', 'email', 'firstName', 'lastName', 'enabled', 'actions'];

  ngOnInit() {
    this.loadUsers().then();
  }

  async loadUsers() {
    this.loading.set(true);
    try {
      const keycloakUsers = await this.usersService.getUsers();
      this.users.set(keycloakUsers);
    } catch {
      this.users.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  openFormUser() {
    const dialogRef = this.dialog.open(FormUser, {
      width: '500px',
      disableClose: true,
      data: { mode: 'create' } as UserDialogData,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsers();
      }
    });
  }

  editUser(user: User) {
    const dialogRef = this.dialog.open(FormUser, {
      width: '500px',
      disableClose: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        enabled: user.enabled,
        mode: 'edit',
      } as UserDialogData,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsers();
      }
    });
  }

  async deleteUser(user: User) {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '350px',
      data: {
        title: this.translate.instant('USERS.CONFIRM_DELETE_TITLE'),
        message: this.translate.instant('USERS.CONFIRM_DELETE_MESSAGE', { username: user.username }),
      } as ConfirmDialogData,
    });

    dialogRef.afterClosed().subscribe(async (confirmed) => {
      if (confirmed) {
        try {
          await this.usersService.deleteUser(user.id);
          this.snackBar.open(
            this.translate.instant('USERS.USER_DELETED'),
            this.translate.instant('ACCOUNT.CLOSE'),
            { duration: 3000 }
          );
          await this.loadUsers();
        } catch {
          this.snackBar.open(
            this.translate.instant('USERS.USER_DELETE_ERROR'),
            this.translate.instant('ACCOUNT.CLOSE'),
            { duration: 3000 }
          );
        }
      }
    });
  }
}
