import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { ResponsiveService } from './shared/services/responsive.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  public responsive = inject(ResponsiveService);
  sidenavOpened = signal(true);

  navItems = [
    { icon: 'home', label: 'Home', active: true },
    { icon: 'inbox', label: 'Inbox', badge: '3' },
    { icon: 'search', label: 'Search' },
    { icon: 'group', label: 'Team' },
    { icon: 'notifications', label: 'Notifications' },
    { icon: 'settings', label: 'Settings' },
  ];

  constructor() {
    const registry = inject(MatIconRegistry);
    registry.setDefaultFontSetClass('material-symbols-outlined');
  }

  toggleSidenav() {
    this.sidenavOpened.update(v => !v);
  }
}
