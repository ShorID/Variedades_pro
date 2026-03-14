import { Injectable } from '@angular/core';
import { SupabaseService } from '../../../services/supabase.service'; // Tu servicio base

@Injectable({
  providedIn: 'root',
})
export class HistorialhttpServices {
  
  constructor(private supabase: SupabaseService) {}

  // 1. Para la tabla de historial
  async getHistorial(limit = 20) {
    const { data, error } = await this.supabase.client
      .from('vw_historial_facturas')
      .select('*')
      .order('id', { ascending: false })
      .limit(limit);
    return error ? [] : data;
  }

  // 2. Para el gráfico de ventas por día
  async getVentasPorDia(idCliente?: number) {
    let query=
     this.supabase.client
      .from('vw_ventas_diarias') // La vista que creamos en el paso anterior
      .select('fecha, total,cantidad_facturas')
       //.order('fecha', { ascending: true })
      //.limit(7); // Últimos 7 días

      if (idCliente) {
        query = query.eq('id_cliente', idCliente);
      }   
      const { data, error } = await query
      .order('fecha', { ascending: true })
      .limit(7);

    if (error) return { labels: [], values: [], cantidades: [] };

    // Formateamos los datos para Chart.js o ApexCharts
    return {
      labels: data.map(v => v.fecha),
      values: data.map(v => v.total),
      cantidades: data.map(v => v.cantidad_facturas)
    };
  }
}
