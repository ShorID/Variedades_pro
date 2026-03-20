import { Injectable } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service'; // Tu servicio base


@Injectable({
  providedIn: 'root',
})
export class homehttpServices {
  
  constructor(private supabase: SupabaseService) {}

  // 1. Obtener productos con stock bajo (Alertas)
  async getStockBajo(limite: number = 5) {
    const { data, error } = await this.supabase.client
      .from('productos')
      .select('id, nombre, codigo, stock')
      .lt('stock', limite) // Less Than (Menor que)
      .order('stock', { ascending: true });

    if (error) throw error;
    return data;
  }

  // 2. Obtener ventas del día actual para los KPIs
  async getVentasHoy() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    const { data, error } = await this.supabase.client
      .from('ventas')
      .select(`
        id, 
        total, 
        fecha, 
        costo_total,
        clientes (nombre)
      `)
      .gte('fecha', hoy.toISOString()) // mas oigual (Inicio de hoy)
      .lt('fecha', manana.toISOString()) // menos que (Mañana)
      .order('fecha', { ascending: false });

    if (error) throw error;
    return data;
  }

  // 3. Obtener el Rol del usuario (para la Ganancia Estimada)
  getRolUsuario(): string {
    // Aquí puedes leerlo de tu LocalStorage o del Auth de Supabase
    return localStorage.getItem('user_role') || 'USER';
  }

}