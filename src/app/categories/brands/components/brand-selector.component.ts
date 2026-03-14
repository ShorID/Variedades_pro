import {
  Component,
  computed,
  effect,
  input,
  OnDestroy,
  OnInit,
  output,
  signal,
} from '@angular/core';
import {
  CardSelectComponent,
  ICardSelectItem,
} from '../../../components/CardSelector/card-select.component';
import { IInvBrand } from '../../../inventary/interfaces/inventary.interfaces';
import { BrandSelectorCreatorComponent } from './brand-selector-creator.component';

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
      (onCreate)="handleCreate($event)"
      [loading]="loading()"
    />
    <brand-selector-creator
      [title]="createFormTitle()"
      (onClose)="handleCreate()"
      (onSubmit)="onSubmit($event)"
    />
  `,
  imports: [CardSelectComponent, BrandSelectorCreatorComponent],
})
export class BrandSelectorComponent implements OnInit, OnDestroy {
  title = input<string>('Marcas');
  data = input<IInvBrand[]>([]);
  loading = input<boolean>(true);
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
  onSelect = output<IInvBrand | undefined>();
  onRefresh = output();

  selectedItems: string[] = [];
  value = input<string | string[]>();

  valueEffect = effect(() => {
    const value = this.value();
    this.selectedItems = value ? [value].flat() : [];
  });
  createFormTitle = signal<string>('');

  constructor() {}

  ngOnInit() {}

  ngOnDestroy(): void {
    this.valueEffect.destroy();
  }

  onChange(item: ICardSelectItem | null) {
    const selected = this.data().find((dataItem) => dataItem.id === (item ? +item.value : item));
    this.onSelect.emit(selected);
  }

  handleCreate(name: string = '') {
    this.createFormTitle.update(() => name);
  }

  onSubmit(newItem: IInvBrand) {
    this.handleCreate();
    this.onSelect.emit(newItem);
    this.onRefresh.emit();
  }
}
