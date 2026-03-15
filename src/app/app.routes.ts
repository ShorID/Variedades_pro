import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { CheckInComponent } from './check-in/check-in.component';
import { LayoutComponent } from './layout/layout.component';
import { Page404Component } from './page404/page404.component';
import { CategoriesComponent } from './categories/categories.component';
import { IncommingsComponent } from './inventary/incommings/incommings.component';
import { HistorialComponent } from './check-in/historial/historial.component';
import { ClienteComponent } from './check-in/clientes/cliente.component';
import { InventaryComponent } from './inventary/inventary.component';
import { InventaryCreateComponent } from './inventary/components/inventary-create/inventary-create.component';
import { InventaryEditComponent } from './inventary/components/inventary-edit/inventary-edit.component';

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
        component: CheckInComponent,
        
      },
      {
            path: 'history',
            title: 'Historial de Facturas',
            component: HistorialComponent,
          },
      {
            path: 'clients',
            title: 'Clientes',
            component: ClienteComponent,
          },
      {
        path: 'categories',
        title: 'Categorias',
        children: [
          {
            path: '',
            component: CategoriesComponent,
          },
        ],
      },
      {
        path: 'inventary',
        title: 'Inventario',
        children: [
          {
            path: '',
            component: InventaryComponent,
          },
          {
            path: 'create',
            component: InventaryCreateComponent,
          },
          {
            path: 'product/:id',
            component: InventaryEditComponent,
          },
          {
            path: 'incommings',
            component: IncommingsComponent,
            children: [
              {
                path: 'create',
                component: InventaryCreateComponent,
                outlet: 'modal' 
              }
            ]
          },
        ],
      },
      {
        path: 'inventary',
        title: 'Inventario',
        children: [
          {
            path: '',
            component: InventaryComponent,
          },
          {
            path: 'create',
            component: InventaryCreateComponent,
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
