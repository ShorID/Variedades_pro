import { Component, OnInit } from '@angular/core';
import { TextComponent } from "../components/Text/text.component";
import { ProductImagesComponent } from "./product-imgs/product-imgs.component";
import { ProductColorsComponent } from "./product-colors/product-colors.component";
import { ProductSizesComponent } from "./product-sizes/product-sizes.component";

@Component({
  selector: 'check-in',
  templateUrl: './check-in.component.html',
  styleUrl: './check-in.component.scss',
  imports: [TextComponent, ProductImagesComponent, ProductColorsComponent, ProductSizesComponent],
})
export class CheckInComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
