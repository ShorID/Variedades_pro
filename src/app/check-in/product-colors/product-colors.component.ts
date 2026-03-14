import { Component, OnInit } from '@angular/core';
import { TextComponent } from '../../components/Text/text.component';

@Component({
  selector: 'product-colors',
  template: `
    <div class="mb-3">
      <label class="form-label">
        <Text> Colores disponibles </Text>
      </label>
      <div class="row g-2">
        <div class="col-auto">
          <label class="form-colorinput">
            <input name="color" type="checkbox" value="dark" class="form-colorinput-input" />
            <span class="form-colorinput-color bg-dark"></span>
          </label>
        </div>
        <div class="col-auto">
          <label class="form-colorinput form-colorinput-light">
            <input
              name="color"
              type="checkbox"
              value="white"
              class="form-colorinput-input"
              checked
            />
            <span class="form-colorinput-color bg-white"></span>
          </label>
        </div>
        <div class="col-auto">
          <label class="form-colorinput">
            <input name="color" type="checkbox" value="blue" class="form-colorinput-input" />
            <span class="form-colorinput-color bg-blue"></span>
          </label>
        </div>
        <div class="col-auto">
          <label class="form-colorinput">
            <input name="color" type="checkbox" value="azure" class="form-colorinput-input" />
            <span class="form-colorinput-color bg-azure"></span>
          </label>
        </div>
        <div class="col-auto">
          <label class="form-colorinput">
            <input name="color" type="checkbox" value="indigo" class="form-colorinput-input" />
            <span class="form-colorinput-color bg-indigo"></span>
          </label>
        </div>
        <div class="col-auto">
          <label class="form-colorinput">
            <input name="color" type="checkbox" value="purple" class="form-colorinput-input" />
            <span class="form-colorinput-color bg-purple"></span>
          </label>
        </div>
        <div class="col-auto">
          <label class="form-colorinput">
            <input name="color" type="checkbox" value="pink" class="form-colorinput-input" />
            <span class="form-colorinput-color bg-pink"></span>
          </label>
        </div>
        <div class="col-auto">
          <label class="form-colorinput">
            <input name="color" type="checkbox" value="red" class="form-colorinput-input" />
            <span class="form-colorinput-color bg-red"></span>
          </label>
        </div>
        <div class="col-auto">
          <label class="form-colorinput">
            <input name="color" type="checkbox" value="orange" class="form-colorinput-input" />
            <span class="form-colorinput-color bg-orange"></span>
          </label>
        </div>
        <div class="col-auto">
          <label class="form-colorinput">
            <input name="color" type="checkbox" value="yellow" class="form-colorinput-input" />
            <span class="form-colorinput-color bg-yellow"></span>
          </label>
        </div>
        <div class="col-auto">
          <label class="form-colorinput">
            <input name="color" type="checkbox" value="lime" class="form-colorinput-input" />
            <span class="form-colorinput-color bg-lime"></span>
          </label>
        </div>
        <div class="col-auto">
          <label class="form-colorinput">
            <input name="color" type="checkbox" value="green" class="form-colorinput-input" />
            <span class="form-colorinput-color bg-green"></span>
          </label>
        </div>
      </div>
    </div>
  `,
  imports: [TextComponent],
})
export class ProductColorsComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
