import { Component, OnInit } from '@angular/core';
import { TextComponent } from "../../components/Text/text.component";
import { PaginationComponent } from "../../components/pagination/pagination.component";
import { BreadcrumbsComponent } from "../../components/Breadcrumbs/breadcrumbs.component";

@Component({
  selector: 'page-subcategories',
  templateUrl: './subcategories.component.html',
  imports: [TextComponent, PaginationComponent, BreadcrumbsComponent],
})
export class SubcategoriesComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
