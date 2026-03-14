import { Injectable } from '@angular/core';
import {
  IInventaryItem,
  IInventaryItemDetail,
  IRawInventaryItem,
} from '../interfaces/incommings.interfaces';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class InventaryService {
  private items = new BehaviorSubject<IInventaryItem[]>([]);
  items$ = this.items.asObservable();

  setItems(data: IInventaryItem[]) {
    this.items.next(data);
  }

  buildData(data: IRawInventaryItem[]): IInventaryItem[] {
    return data.map((item) => {
      // 1. Extraer subcategoría y categoría (según tu esquema SQL)
      const subCategory = Array.isArray(item.sub_categoria) 
        ? item.sub_categoria[0] 
        : item.sub_categoria;
      
      const marca = Array.isArray(item.marca) ? item.marca[0] : item.marca;

      // 2. Mapear detalles de inventario
      // Nota: Dado que IRaw es una variante, el "detail" suele ser su stock por sucursal
      const details: IInventaryItemDetail[] = (item.inventario || [])
        .filter((inv: any) => inv.activo)
        .map((inv: any): IInventaryItemDetail => ({
          id: item.id,
          id_inventario: inv.id,
          id_sucursal: inv.id_sucursal,
          stock: Number(inv.stock),
          stock_minimo: Number(inv.stock_minimo),
          codigo: item.codigo || '',
          costo: Number(item.costo || 0),
          activo: inv.activo,
          attributes: (item.articulo_variante_atr_val || []).map((av: any) => ({
            id: av.atr_val?.id,
            valor: av.atr_val?.valor,
            nombre_atributo: av.atr_val?.atributo?.nombre
          })),
          packs: item.articulo_empaque || []
        }));

      const newItem: IInventaryItem = {
        id: item.id,
        nombre_variante: item.descripcion || 'Sin descripción',
        codigo: item.codigo || '',
        activo: item.activo,
        marca: marca,
        sub_categoria: subCategory,
        categoria: subCategory?.categoria,
        details: details,
        forSearch: ''
      };

      // 3. Construir string de búsqueda
      const attrString = details.length > 0 
        ? details[0].attributes.map(a => a.valor).join(',') 
        : '';

      newItem.forSearch = [
        newItem.id,
        newItem.nombre_variante,
        newItem.codigo,
        marca?.nombre,
        subCategory?.nombre,
        attrString
      ]
      .filter(val => val !== undefined && val !== null)
      .map(val => `${val}`.toLowerCase())
      .join(',');

      return newItem;
    });
  }
}