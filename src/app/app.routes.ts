import { Routes } from '@angular/router';
import { authGuard } from './auth/guards/auth.guard';
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'landing',
    pathMatch: 'full'
  },
  {
    path: 'landing',
    loadComponent: () => 
      import('./landing/inicio/inicio.component').then(m => m.InicioComponent)
  },
  {
    path: 'users',
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    loadChildren: () =>
      import('./users/users.routes')
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    loadChildren: () =>
      import('./admin/admin.routes')
  },
];
