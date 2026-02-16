import { Component, OnInit } from '@angular/core';
import { BreadcrumbsComponent } from "../components/Breadcrumbs/breadcrumbs.component";
import { IconComponent } from '../components/Icon/icon.component';

@Component({
  selector: 'categories-page',
  templateUrl: 'categories.component.html',
  styleUrl: 'categories.component.scss',
  imports: [BreadcrumbsComponent,IconComponent],
})
export class CategoriesComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
