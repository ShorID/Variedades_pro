import { Component, OnInit } from '@angular/core';
import { TextComponent } from "../../components/Text/text.component";
import { PaginationComponent } from "../../components/pagination/pagination.component";
import { BreadcrumbsComponent } from "../../components/Breadcrumbs/breadcrumbs.component";

@Component({
  selector: 'page-brands',
  templateUrl: './brands.component.html',
  imports: [TextComponent, PaginationComponent, BreadcrumbsComponent],
})
export class BrandsComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
