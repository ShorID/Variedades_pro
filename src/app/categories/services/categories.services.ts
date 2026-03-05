import { Injectable } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { from } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CategoriesServices {
  constructor(private supabase:SupabaseService){}
  
  getCats(page: number = 1, limit: number = 10, filter: string = '') {
    const fromIndex = (page - 1) * limit;
    const toIndex = fromIndex + limit - 1;

    return from(
      this.supabase.client
      .from('vw_categoria_detalle')
      .select('*', { count: 'exact'})
      .order('active', { ascending: false })
      .order('id', { ascending: false })
      .range(fromIndex, toIndex)
    );
  }

  getSubCats(id_cat: number, page: number = 1, limit: number = 10, filter: string = '') {
    const fromIndex = (page - 1) * limit;
    const toIndex = fromIndex + limit - 1;

    return from(
      this.supabase.client
      .from('vw_sub_categoria_detalle')
      .select('*', { count: 'exact'})
      .eq("id_cat", id_cat)
      .order('active', { ascending: false })
      .order('id', { ascending: false })
      .range(fromIndex, toIndex)
    );
  }

  getBrands(page: number = 1, limit: number = 10, filter: string = '') {
    const fromIndex = (page - 1) * limit;
    const toIndex = fromIndex + limit - 1;

    return from(
      this.supabase.client
      .from('vw_marca_detalle')
      .select(`*`, { count: 'exact'})
      .order('active', { ascending: false })
      .order('id', { ascending: false })
      .range(fromIndex, toIndex)
    );
  }

  getAtrs(page: number = 1, limit: number = 10, filter: string = ''){
    const fromIndex = (page - 1) * limit;
    const toIndex = fromIndex + limit - 1;

    return from(
      this.supabase.client
      .from('vw_atributo_detalle')
      .select(`*`, { count: 'exact'})
      .eq("active_atr", true)
      .order('active', { ascending: false })
      .order('id', { ascending: false })
      .order('attribute', { ascending: false })
      .range(fromIndex, toIndex)
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

}
