import { Injectable } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { combineLatest, from, map, Observable } from 'rxjs';
import {
  IInvAttr,
  IInvAttrItem,
  IInvBrand,
  IInvCategory,
  IInvPack,
  IInvSubCategory,
  IRawInvAttr,
  IRawInvCategories,
} from '../interfaces/inventary.interfaces';
import { IInsertInvProduct, IInsertInvStock } from '../interfaces/inventary-post.interface';

@Injectable({ providedIn: 'root' })
export class InventaryHttpsService {
  constructor(private supabase: SupabaseService) {}

  getInventary(options: {
    limit?: number;
    page?: number;
    q?: string;
    cty?: string;
    sCty?: string;
  }) {
    const { limit = 5, page = 1, q = '', cty = '', sCty = '' } = options;
    let query = this.supabase.client
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
        { count: 'exact' },
      )
      .eq('activo', true)
      .eq('articulo_variante_atr_val.activo', true)
      .eq('articulo_empaque.activo', true)
      .eq('marca.activo', true)
      .range(limit * (page - 1), limit * page);

    if (cty) query = query.eq('sub_categoria.categoria.id', cty);
    if (sCty) query = query.eq('sub_categoria.id', sCty);
    if (q) {
      query = query.ilike('articulo_variante_atr_val.atr_val.valor', `%${q}%`);
      // query = query.or(`descripcion.ilike.%${q}%`);
    }
    return from(query);
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
        .eq('id', productId)
        .eq('articulo_variante_atr_val.activo', true)
        .eq('articulo_empaque.activo', true)
        .eq('marca.activo', true),
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

  insertAttrItem(data: { id_atributo: number; valor: string }) {
    return from(
      this.supabase.client
        .from('atr_val')
        .insert([{ ...data, activo: true }])
        .select(),
    );
  }

  insertAttrItemSubCty(data: { id_sub_categoria: number; id_atr_val: number }) {
    return from(
      this.supabase.client
        .from('sub_categoria_atr_val')
        .insert([{ ...data, activo: true }])
        .select(),
    );
  }

  deleteProduct(id: number) {
    return from(
      this.supabase.client
        .from('articulo_variante')
        .update({ activo: false })
        .eq('id', id)
        .select(),
    );
  }

  insertProduct(data: IInsertInvProduct) {
    return from(
      this.supabase.client
        .from('articulo_variante')
        .insert([{ ...data, activo: true }])
        .select(),
    );
  }

  updateProduct(id: number, data: Partial<IInsertInvProduct>) {
    return from(this.supabase.client.from('articulo_variante').update(data).eq('id', id).select());
  }

  insertProductInv(id_product: number, data: IInsertInvStock) {
    return from(
      this.supabase.client
        .from('inventario')
        .insert([{ ...data, activo: true, id_sucursal: 1, id_articulo_variante: id_product }])
        .select(),
    );
  }

  updateProductInv(id: number, data: Partial<IInsertInvStock>) {
    return from(this.supabase.client.from('inventario').update(data).eq('id', id).select());
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
  updateProductAttr(id: number, idAttrItem: number, active: boolean) {
    return from(
      this.supabase.client
        .from('articulo_variante_atr_val')
        .update({ activo: active })
        .eq('id_articulo_variante', id)
        .eq('id_art_val', idAttrItem)
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

  updateProductPack(id: number, data: Partial<IInvPack>) {
    return from(
      this.supabase.client
        .from('articulo_empaque')
        .update({
          ...data,
          id_articulo_variante: id,
          ...('unidades_empaques' in data ? { unidades_empaque: data.unidades_empaques } : {}),
        })
        .eq('id', data.id)
        .select(),
    );
  }

  insertSubCategory(data: Omit<IInvSubCategory, 'id'>) {
    return from(
      this.supabase.client
        .from('sub_categoria')
        .insert([
          { id_categoria: data.id_categoria, activo: true, nombre: data.nombre, icono: data.icono },
        ])
        .select('*'),
    );
  }

  getBrands() {
    return from(this.supabase.client.from('marca').select('*').eq('activo', true));
  }

  insertBrand(data: Pick<IInvBrand, 'icono' | 'nombre'>) {
    return from(
      this.supabase.client
        .from('marca')
        .insert([{ ...data, activo: true }])
        .select('*'),
    );
  }
}
