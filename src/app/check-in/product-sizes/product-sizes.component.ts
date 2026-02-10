import { Component, OnInit } from '@angular/core';
import { TextComponent } from '../../components/Text/text.component';

@Component({
  selector: 'product-sizes',
  template: `
    <div class="mb-3">
      <div class="form-label">
        <Text> Tamaños disponibles </Text>
      </div>
      <div>
        <label class="form-check form-check-inline">
          <input class="form-check-input" type="radio" name="radios-inline" checked />
          <span class="form-check-label">S</span>
        </label>
        <label class="form-check form-check-inline">
          <input class="form-check-input" type="radio" name="radios-inline" />
          <span class="form-check-label">M</span>
        </label>
        <label class="form-check form-check-inline">
          <input class="form-check-input" type="radio" name="radios-inline" disabled />
          <span class="form-check-label">L</span>
        </label>
      </div>
    </div>
  `,
  imports: [TextComponent],
})
export class ProductSizesComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
