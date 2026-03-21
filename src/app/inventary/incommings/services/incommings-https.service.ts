import { Injectable } from '@angular/core';
import { SupabaseService } from '../../../services/supabase.service';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class InventaryHttpsService {
  constructor(private supabase: SupabaseService) { }

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
        .eq('activo', true)
    );
  }


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

  updateStock(idVariante: number, nuevoStock: number): Observable<any> {
    return from(
      this.supabase.client
        .from('inventario')
        .update({ stock: nuevoStock })
        .eq('id_articulo_variante', idVariante)
        .select()
    );
  }

  updateVariante(idVariante: number, datos: { costo: number, codigo: string }): Observable<any> {
    return from(
      this.supabase.client
        .from('articulo_variante')
        .update(datos)
        .eq('id', idVariante)
    );
  }


  async linkAttributesToVariant(idVariante: number, atributos: any[]) {
    console.log("Iniciando linkAttributesToVariant para variante:", idVariante);

    try {
      const { error: deleteError } = await this.supabase.client
        .from('articulo_variante_atr_val')
        .delete()
        .eq('id_articulo_variante', idVariante);

      if (deleteError) {
        console.error("Error al limpiar relaciones previas:", deleteError);
      }

      for (const atr of atributos) {
        if (!atr.id_atributo || !atr.valor) {
          console.warn("Atributo ignorado por falta de ID o Valor:", atr);
          continue;
        }

        const valorLimpio = atr.valor.trim();

        try {
          let { data: valAtr } = await this.supabase.client
            .from('atr_val')
            .select('id')
            .eq('id_atributo', atr.id_atributo)
            .ilike('valor', valorLimpio)
            .maybeSingle();

          if (!valAtr) {
            const { data: newVal, error: errorInsert } = await this.supabase.client
              .from('atr_val')
              .insert({ id_atributo: atr.id_atributo, valor: valorLimpio, activo: true})
              .select()
              .single();

            if (errorInsert) throw errorInsert;
            valAtr = newVal;
          }

          if (valAtr) {
            const { error: errorRel } = await this.supabase.client
              .from('articulo_variante_atr_val')
              .insert({
                id_articulo_variante: idVariante,
                id_art_val: valAtr.id,
                activo: true
              });

            if (errorRel) {
              console.error("linkAttributesToVariant > errorRel > ", errorRel);
            } else {
              console.log(`Relación creada: Variante ${idVariante} -> Valor ${valAtr.id}`);
            }
          }
        } catch (err) {
          console.error("Error en el bucle de atributos para:", valorLimpio, err);
        }
      }
    } catch (globalErr) {
      console.error("Error global en linkAttributesToVariant:", globalErr);
    }
  }

  getAtributosMaestros(): Observable<any[]> {
    return from(
      this.supabase.client
        .from('atributo')
        .select('id, nombre')
        .order('nombre', { ascending: true })
    ).pipe(
      map(response => {
        if (response.error) throw response.error;
        return response.data || [];
      })
    );
  }
}