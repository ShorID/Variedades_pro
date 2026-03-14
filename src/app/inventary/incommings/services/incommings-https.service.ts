import { Injectable } from '@angular/core';
import { SupabaseService } from '../../../services/supabase.service';
import { from, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class InventaryHttpsService {
  constructor(private supabase: SupabaseService) {}

  /**
   * Obtiene el inventario basado en articulo_variante (Eje principal según tu SQL)
   */
  getInventary() {
    return from(
      this.supabase.client
        .from('articulo_variante')
        .select(`
          id,
          costo,
          codigo,
          activo,
          descripcion,
          id_marca,
          id_sub_categoria,
          marca!inner (
            id,
            nombre,
            icono
          ),
          sub_categoria!inner (
            id,
            nombre,
            icono,
            categoria!inner (
              id,
              nombre,
              icono
            )
          ),
          inventario (
            id,
            id_sucursal,
            stock,
            stock_minimo,
            activo
          ),
          articulo_empaque (
            id,
            nombre,
            unidades_empaque,
            precio_venta,
            codigo,
            activo
          ),
          articulo_variante_atr_val (
            id,
            activo,
            atr_val!inner (
              id,
              valor,
              activo,
              atributo!inner (
                id,
                nombre
              )
            )
          )
        `)
        .eq('activo', true) // Opcional: solo traer variantes activas
    );
  }

  /**
   * Obtiene categorías con sus subcategorías y atributos predefinidos
   */
  getCategories() {
    return from(
      this.supabase.client
        .from('categoria')
        .select(`
          id,
          nombre,
          icono,
          activo,
          sub_categoria (
            id,
            nombre,
            icono,
            activo,
            sub_categoria_atr_val (
              id,
              atr_val (
                id,
                valor,
                atributo (
                  id,
                  nombre
                )
              )
            )
          )
        `)
        .eq('activo', true)
    );
  }

  getBrands() {
    return from(
      this.supabase.client
        .from('marca')
        .select('*')
        .eq('activo', true)
    );
  }

  /**
   * Inserta una nueva variante de artículo
   * Nota: Eliminamos la referencia a la tabla 'articulo' que no existe en tu SQL
   */
  insertProductVariant(data: { 
    id_marca: number; 
    id_sub_categoria: number; 
    costo: number; 
    codigo: string; 
    descripcion: string;
  }) {
    return from(
      this.supabase.client
        .from('articulo_variante')
        .insert([{ ...data, activo: true }])
        .select()
    );
  }

  /**
   * Registra stock inicial en la tabla inventario
   */
  insertInitialInventory(data: {
    id_articulo_variante: number;
    id_sucursal: number;
    stock: number;
    stock_minimo: number;
  }) {
    return from(
      this.supabase.client
        .from('inventario')
        .insert([{ ...data, activo: true }])
        .select()
    );
  }

  /**
 * Actualiza el stock de una variante específica en Supabase
 * @param idVariante ID de la variante del artículo
 * @param nuevoStock El valor total (Stock Actual + Ingreso)
 */
  updateStock(idVariante: number, nuevoStock: number): Observable<any> {
    return from(
      this.supabase.client
        .from('inventario')
        .update({ stock: nuevoStock })
        .eq('id_articulo_variante', idVariante)
        .select() // Agregamos select para confirmar la respuesta
    );
  }
}