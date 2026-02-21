import { Injectable } from '@angular/core';
import {
  IInvAttr,
  IInvAttrItem,
  IInventaryItem,
  IRawInventaryItem,
} from '../interfaces/inventary.interfaces';
import { BehaviorSubject } from 'rxjs';
import { ICategories, ISubCategories } from '../../categories/interfaces/categories.interface';

@Injectable({ providedIn: 'root' })
export class InventaryService {
  private items = new BehaviorSubject<IInventaryItem[]>([]);
  items$ = this.items.asObservable();

  constructor() {}

  setItems(data: IInventaryItem[]) {
    this.items.next(data);
  }

  buildData(data: IRawInventaryItem[]): {
    items: IInventaryItem[];
    categories: ICategories[];
    subcategories: ISubCategories[];
  } {
    let categories: Record<string, ICategories> = {};
    let subCategories: Record<string, ISubCategories> = {};
    const newData: IInventaryItem[] = data.map((item) => {
      let itemAttr: IInvAttrItem[] = [];
      
      const subCategory =
        Array.isArray(item.sub_categoria) && item.sub_categoria.length
          ? item.sub_categoria[0]
          : item.sub_categoria;
      subCategories[subCategory.id] = subCategory;
      categories[subCategory.categoria.id] = {
        ...(categories[subCategory.categoria.id]
          ? categories[subCategory.categoria.id]
          : subCategory.categoria),
        qty: (categories[subCategory.categoria.id]?.qty || 0) + 1,
      };

      let newItem: IInventaryItem = {
        forSearch: '',
        activo: item.activo,
        id: item.id,
        codigo: item.codigo,
        categoria: subCategory.categoria,
        sub_categoria: subCategory,
        descripcion: item.descripcion,
        marca: Array.isArray(item.marca) && item.marca.length ? item.marca[0] : item.marca,
        packs: item.articulo_empaque,
        inventary: item.inventario,
        attributes: item.articulo_variante_atr_val
          .map(({ atr_val }) => {
            return (Array.isArray(atr_val) ? atr_val : [atr_val]).map((item) => {
              itemAttr.push(item);
              return {
                activo: item.activo,
                id: item.id,
                id_atributo: item.id_atributo,
                valor: item.valor,
              };
            });
          })
          .flat(),
      };

      newItem.forSearch = [
        newItem.id,
        newItem.codigo,
        newItem.marca.nombre,
        newItem.categoria.nombre,
        newItem.sub_categoria.nombre,
        itemAttr.map((item) => item.valor).join(','),
      ]
        .flat()
        .map((item) => `${item}`.toLowerCase())
        .join(',');

      return newItem;
    });
    return {
      items: newData,
      categories: Object.values(categories),
      subcategories: Object.values(subCategories),
    };
  }
}
