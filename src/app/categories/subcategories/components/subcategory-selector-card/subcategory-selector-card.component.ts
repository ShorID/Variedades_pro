import { Component, computed, effect, input, OnDestroy, OnInit, output } from '@angular/core';
import {
  ICardSelectItem,
  CardSelectComponent,
} from '../../../../components/CardSelector/card-select.component';
import { ISubCategories } from '../../../interfaces/categories.interface';

@Component({
  selector: 'app-subcategory-selector',
  template: `
    <app-card-select
      [title]="title()"
      [items]="parseData()"
      [errorMsg]="errorMsg()"
      [icon]="icon()"
      (onSelect)="onChange($event)"
      [canUnselect]="canUnselect()"
      [canCreate]="canCreate()"
      [mode]="mode()"
      [value]="selectedItems"
    />
  `,
  imports: [CardSelectComponent],
})
export class SubcategorySelectorComponent implements OnInit, OnDestroy {
  canUnselect = input<boolean>(false);
  title = input<string>('Categorias');
  icon = input<string>('Shapes');
  categoryId = input<number>(0);
  data = input<ISubCategories[]>([]);
  hearingCategory = input<boolean>(true);
  parseData = computed<ICardSelectItem[]>(() => {
    if (this.hearingCategory() && !this.categoryId()) return [];
    return this.data().map((item): ICardSelectItem => {
      return {
        label: item.nombre,
        value: item.id + '',
      };
    });
  });
  errorMsg = computed(() => {
    if (this.hearingCategory() && !this.categoryId()) return 'Debes seleccionar una categoria primero';
    if (this.categoryId() && !this.data().length) return 'Sin subcategorias';
    return '';
  });

  mode = input<'select' | 'card'>('card');
  canCreate = input<boolean>(false);
  onSelect = output<ISubCategories | undefined>();

  selectedItems: string[] = [];
  value = input<string | string[]>();

  valueEffect = effect(() => {
    const value = this.value();
    this.selectedItems = value ? [value].flat() : [];
  });

  constructor() {}

  ngOnInit() {}

  ngOnDestroy(): void {
    this.valueEffect.destroy();
  }

  onChange(item: ICardSelectItem | null) {
    const selected = this.data().find((dataItem) => dataItem.id === (item ? +item.value : item));
    this.onSelect.emit(selected);
  }
}
