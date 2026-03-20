import { Injectable } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { from, of, switchMap, mapTo } from 'rxjs';

//Interfaces
import { IinsertUpdateCat, IinsertUpdateSubCat } from '../interfaces/categories.interface';
import { IinsertUpdateBrand } from '../interfaces/brand.interface';
import { IinsertUpdateAttr, ISubCatAtrVal } from '../interfaces/attributes.interface';

@Injectable({
  providedIn: 'root',
})
export class CategoriesServices {
  constructor(private supabase:SupabaseService){}
  
  getCats(page: number = 1, limit: number = 10, filter: string = '') {
    const fromIndex = (page - 1) * limit;
    const toIndex = fromIndex + limit - 1;

    let query =  this.supabase.client
      .from('vw_categoria_detalle')
      .select('*', { count: 'exact'})
      .eq('active', true)

    console.log(filter);

    if (filter) 
      query = query.ilike('name', `%${filter}%`);

    query = query.order('active', { ascending: false })
            .order('id', { ascending: false })
            .range(fromIndex, toIndex)

    return from(query);
  }

  getSubCats(id_cat: number, page: number = 1, limit: number = 10, filter: string = '') {
    const fromIndex = (page - 1) * limit;
    const toIndex = fromIndex + limit - 1;

    let query = this.supabase.client
      .from('vw_sub_categoria_detalle')
      .select('*', { count: 'exact'})
      .eq("id_cat", id_cat)
      .eq('active', true);

    if (filter) 
      query = query.ilike('name', `%${filter}%`);

    query = query
      .order('active', { ascending: false })
      .order('id', { ascending: false })
      .range(fromIndex, toIndex)

    return from(query);
  }

  getBrands(page: number = 1, limit: number = 10, filter: string = '') {
    const fromIndex = (page - 1) * limit;
    const toIndex = fromIndex + limit - 1;


    let query = this.supabase.client
    .from('vw_marca_detalle')
    .select(`*`, { count: 'exact'})
    .eq('active', true)

    if (filter) 
      query = query.ilike('name', `%${filter}%`);

    query = query
      .order('active', { ascending: false })
      .order('id', { ascending: false })
      .range(fromIndex, toIndex)

    return from(query);
  }

  getAtrs(page: number = 1, limit: number = 10, filter: string = ''){
    const fromIndex = (page - 1) * limit;
    const toIndex = fromIndex + limit - 1;

    let query = this.supabase.client
      .from('vw_atributo_detalle')
      .select(`*`, { count: 'exact'})
      .eq("active_atr", true)

    if (filter) 
      query = query.ilike('value', `%${filter}%`);

    query = query
      .order('active', { ascending: false })
      .order('id', { ascending: false })
      .order('attribute', { ascending: false })
      .range(fromIndex, toIndex)

    return from(query);
  }

  getAtrValue(id: number, filter: string = ''){
    let query = this.supabase.client
      .from('vw_atr_val')
      .select(`*`)
      .eq("id_sub_categoria", id)

    if (filter) 
      query = query.ilike('value', `%${filter}%`);

    return from(query);
  }

  getAvailableValues(id_atr: number, id_sub: number, filter: string, exclude: number[]){
    return from( this.supabase.client
      .rpc("get_available_values", {id_atr: id_atr, id_sub: id_sub, filter: filter, exclude: exclude})
    );
  }

  fillDropdown(){
    return from(
      this.supabase.client
      .from('atributo')
      .select('id, nombre')
      .eq("activo", true)
    );
  }

  updateState(entity: string, id: number, state: boolean){
    return from(
      this.supabase.client
      .from(entity)
      .update({activo: !state})
      .eq("id", id)
    );
  }

  checkOut(entity: string, name: string){
    return from (
      this.supabase.client
      .from(entity)
      .select(`id`)
      .ilike('nombre', name)
      .limit(1)
    );
  }

  checkOutAttr(value: string, id_attribute: number){
    return from (
      this.supabase.client
      .from('atributo')
      .select(`
        id,
        nombre,
        activo,
        atr_val!inner(
          valor,
          activo
        )      
      `)
      .eq('id', id_attribute)
      .eq('activo', true)
      .ilike('atr_val.valor', value)
      .limit(1)
    );
  }

  addEdit(entity:string, action: string, body: IinsertUpdateCat[] | IinsertUpdateSubCat[] | IinsertUpdateBrand[] | IinsertUpdateAttr[]){
    console.log(entity, action, body)

    switch (action) {
      case "save":
        return from(
          this.supabase.client
            .from(entity)
            .insert(body)
            .select()
        );

      case "edit":

        return from(
          this.supabase.client
            .from(entity)
            .update(body)
            .eq('id', body[0]?.id)
            .select()
        );

      default:
        throw new Error('Invalid action');
    }
  }

  insertAtrValue(
    AtrsValues: ISubCatAtrVal[],
    insertsAtrsValues: IinsertUpdateAttr[],
    updatesAtrsValues: number[],
    id_sub_categoria: number
  ) {

    const insertRelation = (values: ISubCatAtrVal[]) => {
      return from(
        this.supabase.client
          .from("sub_categoria_atr_val")
          .insert(values)
      );
    };

    const updateState$ = updatesAtrsValues.length > 0
      ? from(
          this.supabase.client
            .from('sub_categoria_atr_val')
            .update({ activo: false })
            .eq("id_sub_categoria", id_sub_categoria)
            .in('id_atr_val', updatesAtrsValues)
        ).pipe(mapTo(null))
      : of(null); 

    return updateState$.pipe(
      switchMap(() => {

        if (AtrsValues.length === 0 && insertsAtrsValues.length === 0)
          return of(null);

        if (insertsAtrsValues.length > 0) {
          return from(
            this.supabase.client
              .from("atr_val")
              .insert(insertsAtrsValues)
              .select()
          ).pipe(
            switchMap(({ data, error }) => {
              if (error) throw error;

              const nuevos = (data ?? []).map(item => ({
                id_atr_val: item.id,
                id_sub_categoria: id_sub_categoria,
                activo: true
              })) as ISubCatAtrVal[];

              const finalValues = [...AtrsValues, ...nuevos];

              return insertRelation(finalValues);
            })
          );
        }

        if (AtrsValues.length === 0)
          return of(null);

        return insertRelation(AtrsValues);
      })
    );
  }
}
