import { Component, computed, effect, input, OnDestroy, OnInit, output } from '@angular/core';
import {
  CardSelectComponent,
  ICardSelectItem,
} from '../../../components/CardSelector/card-select.component';
import { IInvCategory } from '../../../inventary/interfaces/inventary.interfaces';

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
      [value]="selectedItems"
    />
  `,
  imports: [CardSelectComponent],
})
export class CategoriesSelectorComponent implements OnInit, OnDestroy {
  canUnselect = input<boolean>(false);
  title = input<string>('Categorias');
  icon = input<string>('Shapes');
  data = input<IInvCategory[]>([]);
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
  onSelect = output<IInvCategory | undefined>();

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
    const selected = this.data().find((dataItem) => dataItem.id === (item ? +item.value : null));
    this.onSelect.emit(selected);
  }
}
