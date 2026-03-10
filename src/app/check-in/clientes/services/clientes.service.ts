import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { SupabaseService } from '../../../services/supabase.service';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root',
})
export class ClientesService {
   constructor(private http: HttpClient,private supabase: SupabaseService) {}
  buscarClientes(termino: string): Observable<any[]> {
  return from(
    this.supabase.client
      .from('cliente')
      .select('id, nombre, numero_ruc')
      .ilike('nombre', `%${termino}%`) // Busca coincidencias parciales
      .limit(5)
  ).pipe(map(res => res.data || []));
}
async saveClienteRPC(c: any) {
  const { data, error } = await this.supabase
    .rpc('guardar_cliente', {
      p_nombre: c.nombre,
      p_personeria: c.personeria,
      p_telefono: c.telefono,
      p_direccion: c.direccion,
      p_clasificacion: c.clasificacion,
      p_identificacion: c.identificacion
    });

  if (error) {
    console.error("Error en RPC:", error.message);
    throw error;
  }
  return data;
}

  async obtener_Historial(clienteId?: number) {
  let query = this.supabase.client
    .from('vw_historial_facturas') // Tu vista de SQL
    .select('*')
    .order('fecha_venta', { ascending: false });

  // Si pasamos un ID, filtramos la consulta
  if (clienteId) {
    query = query.eq('id', clienteId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

async updateClienteRPC(c: any) {
  const { data, error } = await this.supabase.rpc('editar_cliente', {
    p_id: c.id,
    p_nombre: c.nombre,
    p_personeria: c.personeria,
    p_telefono: c.telefono,
    p_direccion: c.direccion,
    p_clasificacion: c.clasificacion,
    p_identificacion: c.identificacion
  });
  if (error) throw error;
  return data;
}

async deleteClienteRPC(id: number) {
  const { data, error } = await this.supabase.rpc('desactivar_cliente', { p_id: id });
  if (error) throw error;
  return data;
}

async obtener_Clientes() {
  const { data, error } = await this.supabase.client
    .from('vw_clientes_facturas') // Nombre exacto de tu tabla en Supabase, aqui no debe ir asteriscco
    .select('*')
    .order('nombre', { ascending: true });

  if (error) {
    console.error('Error al obtener clientes:', error.message);
    throw error;
  }
  return data;
}

async getVentasPorCliente(id: string) {
  const { data, error } = await this.supabase.client
    .from('vw_historial_facturas')
    .select('*')
    .eq('id_cliente', id) // <-- Verifica que en Supabase se llame así
    .order('fecha_facturacion', { ascending: false });

  if (error) throw error;
  return data;
}

}
