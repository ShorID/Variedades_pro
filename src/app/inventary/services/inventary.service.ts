import { Injectable } from '@angular/core';
import {
  IInventaryItem,
  IInventaryItemDetail,
  IRawInventaryItem,
} from '../interfaces/inventary.interfaces';
import { BehaviorSubject } from 'rxjs';
import { PropType } from '../../utils/types/commons';

@Injectable({ providedIn: 'root' })
export class InventaryService {
  private items = new BehaviorSubject<IInventaryItem[]>([]);
  items$ = this.items.asObservable();

  constructor() {}

  setItems(data: IInventaryItem[]) {
    this.items.next(data);
  }

  buildData(data: IRawInventaryItem[]): IInventaryItem[] {
    return data.map((item) => {
      let itemAttr: PropType<IInventaryItemDetail, 'attributes'> = [];
      const subCategory =
        Array.isArray(item.sub_categoria) && item.sub_categoria.length
          ? item.sub_categoria[0]
          : item.sub_categoria;
      let newItem: IInventaryItem = {
        forSearch: '',
        activo: item.activo,
        id: item.id,
        nombre: item.nombre,
        codigo: item.codigo,
        modelo: item.modelo,
        categoria: subCategory.categoria,
        sub_categoria: subCategory,
        marca: Array.isArray(item.marca) && item.marca.length ? item.marca[0] : item.marca,
        details: item.articulo_variante.map((d): IInventaryItemDetail => {
          let dInventary = d.inventario.find((i) => i.activo);

          return {
            activo: d.activo,
            id: dInventary?.id_articulo_variante || 0,
            stock: dInventary?.stock || 0,
            stock_minimo: dInventary?.stock_minimo || 0,
            id_sucursal: dInventary?.id_sucursal || 0,
            id_inventario: dInventary?.id || 0,
            codigo: d.codigo,
            costo: d.costo,
            attributes: d.articulo_variante_atr_val
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
            packs: d.articulo_empaque,
          };
        }),
      };

      newItem.forSearch = [
        newItem.id,
        newItem.nombre,
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
  }
}
