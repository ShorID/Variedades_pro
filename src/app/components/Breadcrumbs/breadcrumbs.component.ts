import { Component, OnInit } from '@angular/core';
import { TextComponent } from "../Text/text.component";
import { IconComponent } from "../Icon/icon.component";

@Component({
  selector: 'app-breadcrumb',
  template: `<ol class="breadcrumb" aria-label="breadcrumbs">
    <li class="breadcrumb-item">
      <a href="#">
        <Text tagClass="d-flex align-items-center">
          <app-icon name='House' class="me-2" [size]="18" />
          Home
        </Text>
      </a>
    </li>
    <li class="breadcrumb-item">
      <a href="#">Library</a>
    </li>
    <li class="breadcrumb-item active" aria-current="page">
      <a href="#">Data</a>
    </li>
  </ol> `,
  imports: [TextComponent, IconComponent],
})
export class BreadcrumbsComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
