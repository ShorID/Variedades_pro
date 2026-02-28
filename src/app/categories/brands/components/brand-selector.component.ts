import { Component, computed, effect, input, OnDestroy, OnInit, output } from '@angular/core';
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
      [canCreate]="canCreate()"
      [mode]="mode()"
      [value]="selectedItems"
    />
  `,
  imports: [CardSelectComponent],
})
export class BrandSelectorComponent implements OnInit, OnDestroy {
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

  mode = input<'select' | 'card'>('card');
  canCreate = input<boolean>(false);
  onSelect = output<IBrand | undefined>();

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
