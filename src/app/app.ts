import {Component, signal, inject, OnInit} from '@angular/core';
import {NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { ResponsiveService } from './shared/services/responsive.service';
import {MatCardModule} from '@angular/material/card';
import {filter, map} from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
    MatCardModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  public responsive = inject(ResponsiveService);
  private readonly router = inject(Router);
  sidenavOpened = signal(true);
  activeRouteName = signal('');

  navItems = [
    { icon: 'dashboard', label: 'Dashboard', route: '/dashboard' },
    { icon: 'account_balance', label: 'Cuentas y Finanzas', route: '/accounts' },
    { icon: 'trending_up', label: 'Inversiones', route: '/investments' },
    { icon: 'group', label: 'Mis Grupos', badge: '3', route: '/groups' },
  ];

  constructor() {
    const registry = inject(MatIconRegistry);
    registry.setDefaultFontSetClass('material-symbols-outlined');
  }

  ngOnInit(): void {
    this.listenToRouteChanges();
  }

  toggleSidenav() {
    this.sidenavOpened.update(v => !v);
  }

  listenToRouteChanges(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(event => event as NavigationEnd)
    ).subscribe((event) => {
      const rawName = event.urlAfterRedirects?.replaceAll('/', ' ').trim() || '';

      const firstLetter = rawName.charAt(0).toUpperCase();
      this.activeRouteName.set(`${firstLetter}${rawName.slice(1)}`);
    });
  }
}
