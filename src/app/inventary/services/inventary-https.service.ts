import { Injectable } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { from } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class InventaryHttpsService {
  constructor(private supabase: SupabaseService) {}

  getInventary() {
    return from(
      this.supabase.client.from('articulo').select(
        `id,
        nombre,
        modelo,
        codigo,
        activo,
        articulo_variante!inner(
            costo,codigo,activo,
            inventario!inner(*),
            articulo_variante_atr_val!inner(
                atr_val!inner(*)
            ),
            articulo_empaque!inner(*)
        ),
        sub_categoria!inner(*, categoria!inner(*)),
        marca!inner(*)`,
      ),
    );
  }

  getCategories() {
    return from(
      this.supabase.client
        .from('categoria')
        .select(
          '*, sub_categoria!inner(*, sub_categoria_atr_val!inner(*,atr_val!inner(*,atributo!inner())))',
        ),
    );
  }

  getBrands() {
    return from(this.supabase.client.from('marca').select('*'));
  }

  insertProduct(data: {
    id_marca: number;
    nombre: string;
    modelo: string;
    codigo: string;
    id_sub_categoria: number;
  }) {
    return from(
      this.supabase.client
        .from('articulo')
        .insert([{ ...data, activo: true }])
        .select(),
    );
  }
  
  insertProductVariant(data: { id_articulo: number; costo: string; codigo: string }) {
    return from(
      this.supabase.client
        .from('articulo_variante')
        .insert([{ ...data, activo: true }])
        .select(),
    );
  }
}
