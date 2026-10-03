import {Component, inject} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {TranslatePipe} from '@ngx-translate/core';
import {Group} from '../../service/group.service';
import {MembersDialog, MembersDialogData} from '../members-dialog/members-dialog';

export interface GroupInfoDialogData {
  group: Group;
}

@Component({
  selector: 'app-group-info-dialog',
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatListModule,
    TranslatePipe,
  ],
  templateUrl: './group-info-dialog.html',
  styleUrl: './group-info-dialog.scss',
})
export class GroupInfoDialog {
  protected readonly dialogRef = inject(MatDialogRef<GroupInfoDialog>);
  protected readonly data = inject<GroupInfoDialogData>(MAT_DIALOG_DATA);

  private readonly dialog = inject(MatDialog);

  protected openMembers() {
    this.dialog.open(MembersDialog, {
      width: '480px',
      maxWidth: '95vw',
      data: {group: this.data.group} as MembersDialogData,
    });
  }
}
