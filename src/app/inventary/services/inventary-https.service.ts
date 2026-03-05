import { Injectable } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { combineLatest, from, map, Observable } from 'rxjs';
import {
  IInvAttr,
  IInvAttrItem,
  IInvCategory,
  IInvPack,
  IInvSubCategory,
  IRawInvAttr,
  IRawInvCategories,
  IRawInventaryCateogry,
} from '../interfaces/inventary.interfaces';

@Injectable({ providedIn: 'root' })
export class InventaryHttpsService {
  constructor(private supabase: SupabaseService) {}

  getInventary() {
    return from(
      this.supabase.client.from('articulo_variante').select(
        `id,
        costo,
        codigo,
        activo,
        descripcion,
        inventario!inner(*),
        articulo_variante_atr_val!inner(
            atr_val!inner(*)
        ),
        articulo_empaque!inner(*),
        sub_categoria!inner(*, categoria!inner(*)),
        marca!inner(*)`,
      ),
    );
  }

  getInventaryById(productId: number) {
    return from(
      this.supabase.client
        .from('articulo_variante')
        .select(
          `id,
        costo,
        codigo,
        activo,
        descripcion,
        inventario!inner(*),
        articulo_variante_atr_val!inner(
            atr_val!inner(*)
        ),
        articulo_empaque!inner(*),
        sub_categoria!inner(*, categoria!inner(*)),
        marca!inner(*)`,
        )
        .eq('id', productId),
    );
  }

  getInvClasification(): Observable<{
    categories: IInvCategory[];
    subCategories: IInvSubCategory[];
    attributes: IInvAttr[];
  }> {
    return combineLatest([
      from(
        this.supabase.client
          .from('categoria')
          .select('*, sub_categoria!inner(*)')
          .eq('activo', true),
      ).pipe(
        map(({ data, error }) => {
          let categories: IInvCategory[] = [];
          let subCategories: IInvSubCategory[] = [];

          const res: IRawInvCategories[] = data ?? [];
          if (res && res.length)
            res.forEach((rCty) => {
              categories.push(rCty);
              rCty.sub_categoria.forEach((rSCty) => {
                subCategories.push(rSCty);
              });
            });

          return { categories, subCategories };
        }),
      ),
      from(
        this.supabase.client
          .from('atributo')
          .select('*, atr_val!inner(*, sub_categoria_atr_val!inner(id_sub_categoria))')
          .eq('activo', true),
      ).pipe(
        map(({ data, error }) => {
          let attributes: IInvAttr[] = [];
          const res: IRawInvAttr[] = data ?? [];
          if (res && res.length)
            res.forEach((attr) => {
              attributes.push({
                ...attr,
                items: attr.atr_val.map((item) => ({
                  ...item,
                  relatedSubCategories: item.sub_categoria_atr_val.map(
                    (rel) => rel.id_sub_categoria,
                  ),
                })),
              });
            });
          return attributes;
        }),
      ),
    ]).pipe(
      map(([{ categories, subCategories }, attributes]) => ({
        categories,
        subCategories,
        attributes,
      })),
    );
  }

  getBrands() {
    return from(this.supabase.client.from('marca').select('*'));
  }

  insertProduct(data: {
    id_marca: number;
    descripcion: string;
    costo: string;
    codigo: string;
    id_sub_categoria: number;
  }) {
    return from(
      this.supabase.client
        .from('articulo_variante')
        .insert([{ ...data, activo: true }])
        .select(),
    );
  }

  insertProductInv(id: number, data: { stock: number; stock_minimo: number }) {
    return from(
      this.supabase.client
        .from('inventario')
        .insert([{ ...data, activo: true, id_sucursal: 1, id_articulo_variante: id }])
        .select(),
    );
  }

  insertProductAttr(id: number, data: IInvAttrItem[]) {
    return from(
      this.supabase.client
        .from('articulo_variante_atr_val')
        .insert(
          data.map((item) => ({ id_articulo_variante: id, id_art_val: item.id, activo: true })),
        )
        .select(),
    );
  }

  insertProductPack(id: number, data: IInvPack[]) {
    return from(
      this.supabase.client
        .from('articulo_empaque')
        .insert(
          data.map((item) => ({
            activo: true,
            id_articulo_variante: id,
            nombre: item.nombre,
            abreviatura: item.abreviatura,
            codigo: item.codigo,
            precio_venta: item.precio_venta,
            unidades_empaque: item.unidades_empaques,
          })),
        )
        .select(),
    );
  }
}
