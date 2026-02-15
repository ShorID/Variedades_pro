import { Component, computed, input, OnInit, output } from '@angular/core';
import {
  ICardSelectItem,
  CardSelectComponent,
} from '../../../components/CardSelector/card-select.component';
import { ISubCategories } from '../../interfaces/categories.interface';

@Component({
  selector: 'app-subcategory-selector',
  template: `
    <app-card-select
      [title]="title()"
      [items]="parseData()"
      [errorMsg]="errorMsg()"
      (onSelect)="onChange($event)"
    />
  `,
  imports: [CardSelectComponent],
})
export class NameComponent implements OnInit {
  title = input<string>('Categorias');
  categoryId = input<number>(0);
  data = input<ISubCategories[]>([]);
  parseData = computed<ICardSelectItem[]>(() =>
    this.data().map((item): ICardSelectItem => {
      return {
        label: item.nombre,
        value: item.id + '',
      };
    }),
  );
  errorMsg = computed(() => {
    if (!this.categoryId()) return 'Debes seleccionar una categoria primero';
    if (this.categoryId() && !this.data().length) return 'Sin subcategorias';
    return '';
  });

  onSelect = output<ISubCategories | undefined>();

  constructor() {}

  ngOnInit() {}

  onChange(item: ICardSelectItem) {
    const selected = this.data().find((dataItem) => dataItem.id === +item.value);
    this.onSelect.emit(selected);
  }
}
