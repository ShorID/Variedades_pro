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
import { IInvAttr, IInvAttrItem } from '../../../inventary/interfaces/inventary.interfaces';
import { AttributesSelectorCreatorComponent } from './attributes-selector-creator.component';

@Component({
  selector: 'app-attributes-selector',
  template: `
    <app-card-select
      [title]="title()"
      [items]="parseData()"
      [errorMsg]="errorMsg()"
      [icon]="icon()"
      (onMultiSelect)="onChange($event)"
      [multiSelect]="true"
      [value]="selectedItems"
      [canCreate]="canCreate()"
      [mode]="mode()"
      (onCreate)="handleCreate($event)"
      [loading]="loading()"
    />
    <attributes-selector-creator
      [title]="createFormTitle()"
      (onClose)="handleCreate()"
      (onSubmit)="onSubmit($event)"
      [idSubCategory]="subCategoryId()"
      [attributes]="data()"
    />
  `,
  imports: [CardSelectComponent, AttributesSelectorCreatorComponent],
})
export class AttributesSelectorComponent implements OnInit, OnDestroy {
  loading = input<boolean>(true);
  icon = input<string>('tag');
  title = input<string>('Atributos');
  subCategoryId = input<number>(0);
  data = input<IInvAttr[]>([]);
  parseData = computed<ICardSelectItem[]>(() => {
    if (!this.subCategoryId()) return [];
    const newData: ICardSelectItem[] = [];
    let tempAttributesItem: ICardSelectItem[] = [];
    this.data().forEach((item) => {
      tempAttributesItem = [];
      item.items?.forEach((attr) => {
        if (!('relatedSubCategories' in attr))
          tempAttributesItem.push({
            value: attr.id + '',
            label: attr.valor,
          });
        else if (attr.relatedSubCategories?.some((item) => item === this.subCategoryId()))
          tempAttributesItem.push({
            value: attr.id + '',
            label: attr.valor,
          });
      });
      if (tempAttributesItem.length) {
        newData.push({
          value: item.id + '',
          label: item.nombre,
          isDivider: true,
        });
        newData.push(...tempAttributesItem);
      }
    });
    return newData;
  });

  errorMsg = computed(() => {
    if (!this.subCategoryId()) return 'Debes seleccionar una sub categoria primero';
    if (this.subCategoryId() && !this.data().length) return 'Sin Atributos';
    return '';
  });

  mode = input<'select' | 'card'>('card');
  canCreate = input<boolean>(false);
  selectedItems: string[] = [];

  onSelect = output<IInvAttrItem[]>();
  onRefresh = output();

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

  onChange(items: ICardSelectItem[]) {
    let selected: IInvAttrItem[] = [];
    let newItems: ICardSelectItem[] = [];
    let qtySelectedPerAttr: Record<number, number> = {};
    items.reverse().forEach((selectedItem) => {
      this.data().forEach((attr) => {
        const maxAttrPerProduct = attr.limite_por_articulo;
        attr.items.forEach((attrItem) => {
          if (
            attrItem.id === +selectedItem.value &&
            (typeof maxAttrPerProduct === 'number'
              ? maxAttrPerProduct > (qtySelectedPerAttr[attr.id] || 0)
              : true)
          ) {
            selected.push(attrItem);
            newItems.push(selectedItem);
            qtySelectedPerAttr[attr.id] = (qtySelectedPerAttr[attr.id] || 0) + 1;
          }
        });
      });
    });
    this.selectedItems = items.map((item) => item.value).reverse();
    this.onSelect.emit(selected.reverse());
  }

  handleCreate(name: string = '') {
    this.createFormTitle.update(() => name);
  }

  onSubmit(newItem: IInvAttrItem) {
    this.handleCreate();

    const selected: IInvAttrItem[] = [newItem];
    this.selectedItems.forEach((selectedItem) => {
      this.data().forEach((attr) => {
        attr.items.forEach((attrItem) => {
          if (attrItem.id === +selectedItem) {
            selected.push(attrItem);
          }
        });
      });
    });
    
    this.onSelect.emit(selected);
    this.onRefresh.emit();
  }
}
