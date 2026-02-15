import { Component, computed, input, OnInit, output } from '@angular/core';
import {
  CardSelectComponent,
  ICardSelectItem,
} from '../../../components/CardSelector/card-select.component';
import { ICategories } from '../../interfaces/categories.interface';

@Component({
  selector: 'app-categories-selector',
  template: ` <app-card-select [title]="title()" [items]="parseData()" icon="Shapes"  (onSelect)="onChange($event)"/> `,
  imports: [CardSelectComponent],
})
export class CategoriesSelectorComponent implements OnInit {
  title = input<string>('Categorias');
  data = input<ICategories[]>([]);
  parseData = computed<ICardSelectItem[]>(() =>
    this.data().map((item): ICardSelectItem => {
      return {
        label: item.nombre,
        value: item.id + '',
      };
    }),
  );

  onSelect = output<ICategories | undefined>();

  constructor() {}

  ngOnInit() {}

  onChange(item: ICardSelectItem) {
    const selected = this.data().find((dataItem) => dataItem.id === +item.value);
    this.onSelect.emit(selected);
  }
}
