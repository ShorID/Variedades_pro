import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { CheckInComponent } from './check-in/check-in.component';
import { LayoutComponent } from './layout/layout.component';
import { Page404Component } from './page404/page404.component';
import { CategoriesComponent } from './categories/categories.component';
import { SubcategoriesComponent } from './categories/subcategories/subcategories.component';
import { BrandsComponent } from './categories/brands/brands.component';
import { AttributesComponent } from './categories/attributes/attributes.component';

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
        path: 'categories',
        title: 'Categorias',
        children: [
          {
            path: '',
            component: CategoriesComponent,
          },
          {
            path: 'subcategories',
            component: SubcategoriesComponent,
          },
          {
            path: 'attributes',
            component: AttributesComponent,
          },
          {
            path: 'brands',
            component: BrandsComponent,
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
