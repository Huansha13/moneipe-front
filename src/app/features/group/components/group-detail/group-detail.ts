import {Component, computed, effect, inject, input, output} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatChipsModule} from '@angular/material/chips';
import {TranslatePipe} from '@ngx-translate/core';
import {Group} from '../../service/group.service';
import {GroupChatService} from '../../service/group-chat.service';
import {MembersDialog, MembersDialogData} from '../members-dialog/members-dialog';
import {GroupInfoDialog, GroupInfoDialogData} from '../group-info-dialog/group-info-dialog';

@Component({
  selector: 'app-group-detail',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatChipsModule,
    TranslatePipe,
  ],
  templateUrl: './group-detail.html',
  styleUrl: './group-detail.scss',
})
export class GroupDetail {
  readonly group = input<Group | null>(null);
  readonly back = output<void>();

  private readonly dialog = inject(MatDialog);
  private readonly chatService = inject(GroupChatService);

  protected readonly messageControl = new FormControl('', {nonNullable: true});
  private readonly draft = toSignal(this.messageControl.valueChanges, {initialValue: ''});

  protected readonly canSend = computed(() => this.draft().trim().length > 0);

  protected readonly messages = computed(() => {
    const groupId = this.group()?.id;
    if (groupId === undefined) return [];

    return this.chatService.messages()[groupId] ?? [];
  });

  constructor() {
    effect(() => {
      const g = this.group();
      if (g) {
        this.chatService.loadMessages(g.id);
      }
    });
  }

  // El contenedor del chat es column-reverse: el primer hijo se pinta abajo (lo más reciente)
  protected readonly reversedMessages = computed(() => [...this.messages()].reverse());

  protected async send(event?: Event) {
    event?.preventDefault();

    const group = this.group();
    const text = this.messageControl.value.trim();
    if (!group || !text) return;

    await this.chatService.send(group.id, text);
    this.messageControl.setValue('');
  }

  protected openInfo() {
    const group = this.group();
    if (!group) return;

    this.dialog.open(GroupInfoDialog, {
      width: '480px',
      maxWidth: '95vw',
      data: {group} as GroupInfoDialogData,
    });
  }

  protected openMembers() {
    const group = this.group();
    if (!group) return;

    this.dialog.open(MembersDialog, {
      width: '480px',
      maxWidth: '95vw',
      data: {group} as MembersDialogData,
    });
  }
}
