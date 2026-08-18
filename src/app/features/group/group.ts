import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-group',
  imports: [TranslatePipe],
  templateUrl: './group.html',
  styleUrl: './group.scss',
})
export class Group {}
