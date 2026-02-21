import { Component, computed, effect, input, OnDestroy, OnInit, output } from '@angular/core';
import {
  CardSelectComponent,
  ICardSelectItem,
} from '../../../components/CardSelector/card-select.component';
import { IInvAttr, IInvAttrItem } from '../../../inventary/interfaces/inventary.interfaces';

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
    />
  `,
  imports: [CardSelectComponent],
})
export class AttributesSelectorComponent implements OnInit, OnDestroy {
  icon = input<string>('tag');
  title = input<string>('Atributos');
  subCategoryId = input<number>(0);
  data = input<IInvAttr[]>([]);
  parseData = computed<ICardSelectItem[]>(() => {
    if (!this.subCategoryId()) return [];
    const newData: ICardSelectItem[] = [];
    this.data().forEach((item) => {
      newData.push({
        value: item.id + '',
        label: item.nombre,
        isDivider: true,
      });
      item.items?.forEach((attr) => {
        if (!('relatedSubCategories' in attr))
          newData.push({
            value: attr.id + '',
            label: attr.valor,
          });
        else if (attr.relatedSubCategories?.some((item) => item === this.subCategoryId()))
          newData.push({
            value: attr.id + '',
            label: attr.valor,
          });
      });
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

  value = input<string | string[]>();

  valueEffect = effect(() => {
    const value = this.value();
    this.selectedItems = value ? [value].flat() : [];
  });

  subcategoryEffect = effect(() => {
    this.subCategoryId();
    this.selectedItems = [];
    this.onSelect.emit([]);
  });

  constructor() {}

  ngOnInit() {}

  ngOnDestroy(): void {
    this.valueEffect.destroy();
    this.subcategoryEffect.destroy();
  }

  onChange(items: ICardSelectItem[]) {
    let selected: IInvAttrItem[] = [];
    items.forEach((selectedItem) => {
      this.data().forEach((attr) => {
        attr.items.forEach((attrItem) => {
          if (attrItem.id === +selectedItem.value) selected.push(attrItem);
        });
      });
    });
    this.selectedItems = items.map((item) => item.value);
    this.onSelect.emit(selected);
  }
}
