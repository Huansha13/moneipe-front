import { Component, inject, OnInit, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { FormUser } from './components/form-user/form-user';

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
    TranslatePipe,
  ],
  templateUrl: './users.html',
  styleUrl: './users.scss'
})
export class Users implements OnInit {
  private readonly dialog = inject(MatDialog);

  users = signal<User[]>([]);
  displayedColumns = ['username', 'email', 'firstName', 'lastName', 'enabled', 'actions'];

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    const mockUsers: User[] = [
      { id: '1', username: 'admin', email: 'admin@example.com', firstName: 'Admin', lastName: 'User', enabled: true },
      { id: '2', username: 'jdoe', email: 'jdoe@example.com', firstName: 'John', lastName: 'Doe', enabled: true },
      { id: '3', username: 'asmith', email: 'asmith@example.com', firstName: 'Alice', lastName: 'Smith', enabled: false },
    ];
    this.users.set(mockUsers);
  }

  openFormUser() {
    const dialogRef = this.dialog.open(FormUser, {
      width: '500px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const newUser: User = {
          id: (this.users().length + 1).toString(),
          ...result,
        };
        this.users.update(users => [...users, newUser]);
      }
    });
  }
}
