import { Component, computed, input, OnInit, output } from '@angular/core';
import { IBrand } from '../interfaces/brand.interface';
import {
  CardSelectComponent,
  ICardSelectItem,
} from '../../../components/CardSelector/card-select.component';

@Component({
  selector: 'app-brands-selector',
  template: `
    <app-card-select
      [title]="title()"
      [items]="parseData()"
      icon="sticker"
      (onSelect)="onChange($event)"
    />
  `,
  imports: [CardSelectComponent],
})
export class BrandSelectorComponent implements OnInit {
  title = input<string>('Marcas');
  data = input<IBrand[]>([]);
  parseData = computed<ICardSelectItem[]>(() =>
    this.data().map((item): ICardSelectItem => {
      return {
        label: item.nombre,
        value: item.id + '',
      };
    }),
  );

  onSelect = output<IBrand | undefined>();

  constructor() {}

  ngOnInit() {}

  onChange(item: ICardSelectItem) {
    const selected = this.data().find((dataItem) => dataItem.id === +item.value);
    this.onSelect.emit(selected);
  }
}
