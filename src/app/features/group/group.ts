import {Component, inject} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatChipsModule} from '@angular/material/chips';
import {GroupService} from './service/group.service';

@Component({
  selector: 'app-group',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    TranslatePipe
  ],
  templateUrl: './group.html',
  styleUrl: './group.scss',
})

export class Group {
  private readonly groupService = inject(GroupService);

  groups = this.groupService.groups;

  protected openFormUser() {
  }
}
