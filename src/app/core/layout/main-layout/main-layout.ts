import {Component, signal, inject, OnInit, effect} from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { TranslateService } from '@ngx-translate/core';
import { filter, map } from 'rxjs';
import { ResponsiveService } from '../../../shared/services/responsive.service';
import { AuthService } from '../../auth/auth.service';
import { LanguageService } from '../../../shared/services/language.service';
import { NavItem } from '../../../shared/models/nav-items.model';
import { LanguageSwitcherComponent } from '../../../shared/components/language-switcher/language-switcher';
import { TranslatePipe } from '@ngx-translate/core';

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
    TranslatePipe,
    LanguageSwitcherComponent,
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss'
})
export class MainLayout implements OnInit {
  public responsive = inject(ResponsiveService);
  public authService = inject(AuthService);
  public language = inject(LanguageService);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);
  sidenavOpened = signal(true);
  activeRouteName = signal('');

  navItems: NavItem[] = [
    { icon: 'dashboard', labelKey: 'NAV.DASHBOARD', route: '/dashboard' },
    { icon: 'account_balance', labelKey: 'NAV.ACCOUNTS', route: '/accounts' },
    { icon: 'trending_up', labelKey: 'NAV.INVESTMENTS', route: '/investments' },
    { icon: 'group', labelKey: 'NAV.MY_GROUPS', badge: '3', route: '/groups' },
  ];

  constructor() {
    effect(() => {
      this.language.currentLang();
      this.setActiveRoute(this.router.url);
    });
  }

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
      this.activeRouteName.set(this.translate.instant('NAV.USER_ACCOUNT'));
      return;
    }
    const item = this.navItems.find(item => item.route === url);
    this.activeRouteName.set(item ? this.translate.instant(item.labelKey!) : '');
  }
}
