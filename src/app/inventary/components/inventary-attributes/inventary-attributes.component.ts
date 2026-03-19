import { Component, computed, input, OnInit } from '@angular/core';
import { IInvAttr } from '../../interfaces/inventary.interfaces';
import {
  ICardSelectItem,
  CardSelectComponent,
} from '../../../components/CardSelector/card-select.component';

type InvAttrItemType = { id: number; title: string; items: ICardSelectItem[] };

@Component({
  selector: 'inventary-attributes',
  template: `
    @for (attr of parseData(); track attr.id) {
      <app-card-select
        [title]="attr.title"
        [items]="attr.items"
        [icon]="'tag'"
        (onMultiSelect)="onChange(attr, $event)"
        [multiSelect]="true"
        [value]="selectedItems[attr.id]"
        [canCreate]="true"
        [mode]="'collapsable'"
      />
    }
    @if (!parseData().length) {
      {{ errorMsg() }}
    }
  `,
  imports: [CardSelectComponent],
})
export class InventaryAttributesComponent implements OnInit {
  subCategoryId = input<number>(0);
  data = input<IInvAttr[]>([]);

  parseData = computed<InvAttrItemType[]>(() => {
    if (!this.subCategoryId()) return [];
    let tempAttributesItem: ICardSelectItem[] = [];
    return this.data()
      .map((item) => {
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
        if (!tempAttributesItem.length) return [];
        return {
          title: item.nombre,
          id: item.id,
          items: tempAttributesItem,
        };
      })
      .flat();
  });
  errorMsg = computed(() => {
    if (!this.subCategoryId()) return 'Debes seleccionar una sub categoria primero';
    if (this.subCategoryId() && !this.data().length) return 'Sin Atributos';
    return '';
  });

  selectedItems: Record<number, string[]> = {};

  constructor() {}

  ngOnInit() {}

  onChange(attr: InvAttrItemType, newSelectItems: ICardSelectItem[]) {
    this.selectedItems[attr.id] = newSelectItems.map((i) => i.value);
  }
}
