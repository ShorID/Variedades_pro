import { Component, OnInit } from '@angular/core';
import { BreadcrumbsComponent } from "../components/Breadcrumbs/breadcrumbs.component";
import { TextComponent } from "../components/Text/text.component";
import { PaginationComponent } from "../components/pagination/pagination.component";

@Component({
  selector: 'categories-page',
  templateUrl: 'categories.component.html',
  styleUrl: 'categories.component.scss',
  imports: [BreadcrumbsComponent, TextComponent, PaginationComponent],
})
export class CategoriesComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
