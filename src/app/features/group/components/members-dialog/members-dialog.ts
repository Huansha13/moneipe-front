import {Component, inject} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {TranslatePipe} from '@ngx-translate/core';
import {Group} from '../../service/group.service';
import {InitialsPipe} from '../../../../shared/pipes/initials.pipe';

export interface MembersDialogData {
  group: Group;
}

@Component({
  selector: 'app-members-dialog',
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatListModule,
    TranslatePipe,
    InitialsPipe,
  ],
  templateUrl: './members-dialog.html',
  styleUrl: './members-dialog.scss',
})
export class MembersDialog {
  protected readonly dialogRef = inject(MatDialogRef<MembersDialog>);
  protected readonly data = inject<MembersDialogData>(MAT_DIALOG_DATA);
}
