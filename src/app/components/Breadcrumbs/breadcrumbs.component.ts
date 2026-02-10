import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-breadcrumb',
  template: `<ol class="breadcrumb" aria-label="breadcrumbs">
    <li class="breadcrumb-item">
      <a href="#">Home</a>
    </li>
    <li class="breadcrumb-item">
      <a href="#">Library</a>
    </li>
    <li class="breadcrumb-item active" aria-current="page">
      <a href="#">Data</a>
    </li>
  </ol> `,
})
export class BreadcrumbsComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
