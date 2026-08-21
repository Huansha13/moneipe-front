import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { roleGuard } from './core/auth/role.guard';

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
        loadComponent: () => import('./features/profile/acount/account').then(m => m.Account)
      },
      {
        path: 'groups',
        loadComponent: () => import('./features/group/group').then(m => m.Group)
       },
      {
        path: 'users',
        canActivate: [roleGuard(['manage-users'])],
        loadComponent: () => import('./features/users/users').then(m => m.Users)
      },
    ]
  },
  {
    path: '**',
    redirectTo: '',
  }
];
