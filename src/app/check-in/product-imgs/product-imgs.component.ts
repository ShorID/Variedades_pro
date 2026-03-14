import { Component, OnInit } from '@angular/core';
import { TextComponent } from "../../components/Text/text.component";

@Component({
  selector: 'product-imgs',
  template: `
    <div class="mb-3">
      <label class="form-label">
        <Text> Mas imagenes del producto </Text>
      </label>
      <div class="row g-2">
        <div class="col-3">
          <label class="form-imagecheck mb-2">
            <input name="image" type="radio" value="1" class="form-imagecheck-input" />
            <span class="form-imagecheck-figure">
              <img
                src="https://picsum.photos/id/237/200/300"
                alt=""
                class="form-imagecheck-image"
              />
            </span>
          </label>
        </div>
        <div class="col-3">
          <label class="form-imagecheck mb-2">
            <input name="image" type="radio" value="2" class="form-imagecheck-input" checked />
            <span class="form-imagecheck-figure">
              <img
                src="https://picsum.photos/id/236/200/300"
                alt=""
                class="form-imagecheck-image"
              />
            </span>
          </label>
        </div>
        <div class="col-3">
          <label class="form-imagecheck mb-2">
            <input name="image" type="radio" value="3" class="form-imagecheck-input" />
            <span class="form-imagecheck-figure">
              <img
                src="https://picsum.photos/id/235/200/300"
                alt=""
                class="form-imagecheck-image"
              />
            </span>
          </label>
        </div>
        <div class="col-3">
          <label class="form-imagecheck mb-2">
            <input name="image" type="radio" value="4" class="form-imagecheck-input" checked />
            <span class="form-imagecheck-figure">
              <img
                src="https://picsum.photos/id/238/200/300"
                alt=""
                class="form-imagecheck-image"
              />
            </span>
          </label>
        </div>
      </div>
    </div>
  `,
  imports: [TextComponent],
})
export class ProductImagesComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
