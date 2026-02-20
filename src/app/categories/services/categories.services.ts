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
