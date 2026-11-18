import { Routes } from '@angular/router';
const adminRoutes: Routes = [
      {
        path: 'usuarios',
        loadComponent: () =>
          import('../admin/features/usuarios/usuarios.component').then((m) => m.UsuariosComponent),
      },
      
      {
        path: 'sucursales',
        loadComponent: () =>
          import('./features/sucursales/sucursales.component').then((m) => m.SucursalesComponent),
      },
      {
        path: 'categorias',
        loadComponent: () =>
          import('./features/categorias/categorias.component').then((m) => m.CategoriasComponent),
      },
       {
        path: 'lugares',
        loadComponent: () =>
          import('./features/lugar/lugar.component').then((m) => m.LugarComponent),
      },
      {
        path: 'subcategorias',
        loadComponent: () =>
          import('./features/subcategorias/subcategorias.component').then((m) => m.SubCategoriasComponent),
      },
    { path: '', redirectTo: 'usuarios', pathMatch: 'full' }
  ];
  export default adminRoutes;