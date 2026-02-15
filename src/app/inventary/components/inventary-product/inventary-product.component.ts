import { Component, input, OnInit } from '@angular/core';
import { IconComponent } from '../../../components/Icon/icon.component';
import { TextComponent } from '../../../components/Text/text.component';
import { IInventaryItem } from '../../interfaces/inventary.interfaces';

@Component({
  selector: 'inventary-product',
  template: `
    <div class="card p-1 px-2">
      <div class="row">
        <app-icon [name]="iconName" class="col-auto" />
        <div class="col-4">
          <Text>{{data().nombre}}</Text>
        </div>
      </div>
    </div>
  `,
  imports: [IconComponent, TextComponent],
})
export class InventaryProductComponent implements OnInit {
  data = input.required<IInventaryItem>();
  iconName: string = '';
  constructor() {}

  ngOnInit() {
    this.iconName = this.data().categoria.icono || 'Barcode';
  }
}
