import {Component, signal, inject, OnInit} from '@angular/core';
import {NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatMenuModule} from '@angular/material/menu';
import {filter, map} from 'rxjs';
import {ResponsiveService} from '../../../shared/services/responsive.service';
import {AuthService} from '../../auth/auth.service';
import {NavItem} from '../../../shared/models/nav-items.model';

@Component({
  selector: 'app-main-layout',
  imports: [
    RouterOutlet,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
    MatCardModule,
    MatMenuModule,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss'
})
export class MainLayout implements OnInit {
  public responsive = inject(ResponsiveService);
  public authService = inject(AuthService);
  private readonly router = inject(Router);
  sidenavOpened = signal(true);
  activeRouteName = signal('');

  navItems: NavItem[] = [
    {icon: 'dashboard', label: 'Dashboard', route: '/dashboard'},
    {icon: 'account_balance', label: 'Cuentas y Finanzas', route: '/accounts'},
    {icon: 'trending_up', label: 'Inversiones', route: '/investments'},
    {icon: 'group', label: 'Mis Grupos', badge: '3', route: '/groups'},
  ];

  ngOnInit(): void {
    this.setActiveRoute(this.router.url);
    this.listenToRouteChanges();
  }

  toggleSidenav() {
    this.sidenavOpened.update(v => !v);
  }

  async logout() {
    await this.authService.logout();
  }

  listenToRouteChanges(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(event => event as NavigationEnd)
    ).subscribe((event) => {
      this.setActiveRoute(event.urlAfterRedirects?.trim() || '');
    });
  }

  private setActiveRoute(url: string) {
    if (url === '/user-account') {
      this.activeRouteName.set('Cuenta de Usuario');
      return;
    }
    const item = this.navItems.find(item => item.route === url);
    this.activeRouteName.set(item?.label || '');
  }
}
