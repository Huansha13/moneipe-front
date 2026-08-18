import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./core/layout/main-layout/main-layout').then(m => m.MainLayout),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard)
      },
      {
        path: 'user-account',
        loadComponent: () => import('./features/profile/acount/acount').then(m => m.Acount)
      },
    ]
  },
  {
    path: '**',
    redirectTo: '',
  }
];
