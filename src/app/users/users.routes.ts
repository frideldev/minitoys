import { Routes } from '@angular/router';
const usersRoutes: Routes = [
    {
      path: 'dashboard',
      loadComponent: () =>
        import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
    },
    {
      path: 'ajustes',
      loadComponent: () =>
        import('./features/ajustes/ajustes.component').then((m) => m.AjustesComponent),
    },
    {
      path: 'ayuda',
      loadComponent: () =>
        import('./features/ayuda/ayuda.component').then((m) => m.AyudaComponent),
    },
    {
      path: 'soporte',
      loadComponent: () =>
        import('./features/ayuda/ayuda.component').then((m) => m.AyudaComponent),
    },
    {
      path: 'inventario',
      loadComponent: () =>
        import('./features/inventario/inventario.component').then((m) => m.InventarioComponent),
    },
    {
        path: 'ventas',
        loadComponent: () =>
          import('./features/ventas/ventas.component').then((m) => m.VentasComponent),
      },
      {
        path: 'orden-venta',
        redirectTo: 'ventas',
        pathMatch: 'full',
      },
      {
        path: 'reportes',
        loadComponent: () =>
          import('./features/reportes/reportes.component').then((m) => m.ReportesComponent),
      },
      {
        path: 'clientes',
        loadComponent: () =>
          import('./features/clientes/clientes.component').then((m) => m.ClientesComponent),
      },
      {
        path: 'formaspago',
        loadComponent: () =>
          import('./features/formaspago/formaspago.component').then((m) => m.FormasPagoComponent),
      },
      
    { path: '', redirectTo: 'ventas', pathMatch: 'full' }
  ];
  export default usersRoutes;