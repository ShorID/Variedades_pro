import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { LayoutComponent } from './layout/layout.component';
import { Page404Component } from './page404/page404.component';
import { IncommingsComponent } from './inventary/incommings/incommings.component';
import { InventaryCreateComponent } from './inventary/components/inventary-create/inventary-create.component';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Sistema de Inventario',
    component: LoginComponent,
  },
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        title: 'Sistema de Inventario',
        component: HomeComponent,
      },
      {
        path: 'home',
        title: 'Sistema de Inventario',
        component: HomeComponent,
      },
      {
        path: 'check-in',
        title: 'Facturar',
        loadComponent: () =>
          import('./check-in/check-in.component').then((m) => m.CheckInComponent),
      },
      {
        path: 'history',
        title: 'Historial de Facturas',
        loadComponent: () =>
          import('./check-in/historial/historial.component').then((m) => m.HistorialComponent),
      },
      {
        path: 'clients',
        title: 'Clientes',
        loadComponent: () =>
          import('./check-in/clientes/cliente.component').then((m) => m.ClienteComponent),
      },
      {
        path: 'categories',
        title: 'Categorias',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./categories/categories.component').then((m) => m.CategoriesComponent),
          },
        ],
      },
      {
        path: 'inventary',
        title: 'Inventario',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./inventary/inventary.component').then((m) => m.InventaryComponent),
          },
          {
            path: 'create',
            loadComponent: () =>
              import('./inventary/components/inventary-create/inventary-create.component').then(
                (m) => m.InventaryCreateComponent,
              ),
          },
          {
            path: 'product/:id',
            loadComponent: () =>
              import('./inventary/components/inventary-edit/inventary-edit.component').then(
                (m) => m.InventaryEditComponent,
              ),
          },
          {
            path: 'incommings',
            component: IncommingsComponent,
            children: [
              {
                path: 'create',
                component: InventaryCreateComponent,
                outlet: 'modal',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: '**',
    component: Page404Component,
  },
];
