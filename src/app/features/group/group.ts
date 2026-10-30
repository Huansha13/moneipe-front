import {Component, computed, inject, signal} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {TranslatePipe} from '@ngx-translate/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatListModule} from '@angular/material/list';
import {MatChipsModule} from '@angular/material/chips';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {Group as GroupModel, GroupService} from './service/group.service';
import {GroupChatService} from './service/group-chat.service';
import {GroupDetail} from './components/group-detail/group-detail';
import {CreateGroupDialog} from './components/create-group-dialog/create-group-dialog';
import {InitialsPipe} from '../../shared/pipes/initials.pipe';
import {AuthService} from '../../core/auth/auth.service';

@Component({
  selector: 'app-group',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    MatChipsModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    TranslatePipe,
    InitialsPipe,
    GroupDetail,
  ],
  templateUrl: './group.html',
  styleUrl: './group.scss',
})
export class Group {
  private readonly groupService = inject(GroupService);
  private readonly chatService = inject(GroupChatService);
  private readonly dialog = inject(MatDialog);
  private readonly authService = inject(AuthService);

  protected unreadCount(groupId: string): number {
    return this.chatService.unreadCount(groupId);
  }

  groups = this.groupService.groups;
  groupCount = this.groupService.groupCount;

  constructor() {
    this.groupService.reloadGroups();
  }

  protected readonly searchControl = new FormControl('', {nonNullable: true});
  protected readonly search = toSignal(this.searchControl.valueChanges, {initialValue: ''});

  protected readonly selectedGroup = signal<GroupModel | null>(null);

  protected readonly filteredGroups = computed(() => {
    const term = this.search().trim().toLowerCase();
    const groups = this.groups();

    if (!term) return groups;

    return groups.filter(group =>
      group.title.toLowerCase().includes(term) ||
      group.description.toLowerCase().includes(term)
    );
  });

  protected selectGroup(group: GroupModel) {
    this.selectedGroup.set(group);
    this.chatService.setActiveGroup(group.id);
  }

  protected closeDetail() {
    this.selectedGroup.set(null);
    this.chatService.setActiveGroup(null);
  }

  protected openFormUser() {
    const dialogRef = this.dialog.open(CreateGroupDialog, {
      width: '500px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.groupService.reloadGroups();
      }
    });
  }
}
