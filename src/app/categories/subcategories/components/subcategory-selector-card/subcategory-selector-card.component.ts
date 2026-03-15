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
  ICardSelectItem,
  CardSelectComponent,
} from '../../../../components/CardSelector/card-select.component';
import { IInvSubCategory } from '../../../../inventary/interfaces/inventary.interfaces';
import { SubcategorySelectorCreatorComponent } from './subcategory-selector-creator.component';

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
      (onCreate)="handleCreate($event)"
      [loading]="loading()"
    />
    <subcategory-selector-creator
      [title]="createFormTitle()"
      [idCategory]="categoryId()"
      (onClose)="handleCreate()"
      (onSubmit)="onSubmit($event)"
    />
  `,
  imports: [CardSelectComponent, SubcategorySelectorCreatorComponent],
})
export class SubcategorySelectorComponent implements OnInit, OnDestroy {
  loading = input<boolean>(true);
  canUnselect = input<boolean>(false);
  title = input<string>('Categorias');
  icon = input<string>('Shapes');
  categoryId = input<number>(0);
  data = input<IInvSubCategory[]>([]);
  hearingCategory = input<boolean>(true);
  parseData = computed<ICardSelectItem[]>(() => {
    if (this.hearingCategory() && !this.categoryId()) return [];
    return (
      this.hearingCategory() && this.categoryId()
        ? this.data().filter((item) => item.id_categoria === this.categoryId())
        : this.data()
    ).map((item): ICardSelectItem => {
      return {
        label: item.nombre,
        value: item.id + '',
      };
    });
  });
  errorMsg = computed(() => {
    if (this.hearingCategory() && !this.categoryId())
      return 'Debes seleccionar una categoria primero';
    if (this.categoryId() && !this.data().length) return 'Sin subcategorias';
    return '';
  });

  mode = input<'select' | 'card'>('card');
  canCreate = input<boolean>(false);
  onSelect = output<IInvSubCategory | undefined>();
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

  onSubmit(newItem: IInvSubCategory) {
    this.handleCreate();
    this.onSelect.emit(newItem);
    this.onRefresh.emit();
  }
}
