import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard)
  },
  {
    path: 'account',
    loadComponent: () => import('./features/profile/acount/acount').then(m => m.Acount)
  },
  {
    path: 'login',
    loadComponent: () => import('./core/login/login').then(m => m.Login)
  }
];
