import { Component, OnInit } from '@angular/core';
import { IconComponent } from '../components/Icon/icon.component';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'page-404',
  template: `
    <div class="empty">
      <div class="empty-header">404</div>
      <p class="empty-title">Oops… ha ocurrido un error!</p>
      <p class="empty-subtitle text-secondary">Intenta acceder a un ruta valida!</p>
      <div class="empty-action">
        <a [routerLink]="'/'" class="btn btn-primary">
          <app-icon name="ArrowBigLeft" class="d-block me-2" />
          Regresar al inicio
        </a>
      </div>
    </div>
  `,
  imports: [IconComponent, RouterLink],
})
export class Page404Component implements OnInit {
  constructor() {}

  ngOnInit() {}
}
