import { Component, computed, input, OnInit, output } from '@angular/core';
import {
  CardSelectComponent,
  ICardSelectItem,
} from '../../../components/CardSelector/card-select.component';
import { ICategories } from '../../interfaces/categories.interface';

@Component({
  selector: 'app-categories-selector',
  template: `
    <app-card-select
      [title]="title()"
      [items]="parseData()"
      [icon]="icon()"
      (onSelect)="onChange($event)"
      [canUnselect]="canUnselect()"
      [canCreate]="canCreate()"
      [mode]="mode()"
    />
  `,
  imports: [CardSelectComponent],
})
export class CategoriesSelectorComponent implements OnInit {
  canUnselect = input<boolean>(false);
  title = input<string>('Categorias');
  icon = input<string>('Shapes');
  data = input<ICategories[]>([]);
  parseData = computed<ICardSelectItem[]>(() =>
    this.data().map((item): ICardSelectItem => {
      return {
        label: item.nombre,
        value: item.id + '',
      };
    }),
  );
  mode = input<'select' | 'card'>('card');
  canCreate = input<boolean>(false);
  onSelect = output<ICategories | undefined>();

  constructor() {}

  ngOnInit() {}

  onChange(item: ICardSelectItem | null) {
    const selected = this.data().find((dataItem) => dataItem.id === (item ? +item.value : null));
    this.onSelect.emit(selected);
  }
}
