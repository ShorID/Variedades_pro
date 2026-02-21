import { Injectable } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
//import { from } from 'rxjs';
import { Producto } from '../interfaces/producto.interface';
import { Cliente } from '../interfaces/cliente.interface';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { createClient} from '@supabase/supabase-js';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';


@Injectable({ providedIn: 'root' })
export class VentasHttpServices {
  constructor(private http: HttpClient,private supabase: SupabaseService) {}
  productos: Producto[] = []; // inicializado
  /*
  //para lo deproducto se extrae del rpc que dee estar en supabase
  getProductos(): Observable<Producto[]> {
  // Convertimos la promesa de Supabase en un Observable de Angular
  return from(this.supabase.rpc('obtener_articulos')).pipe(
    map(response => {
      if (response.error) throw response.error;
      return response.data as Producto[];
    })
    );
  }
*/
getProductos(): Observable<Producto[]> {
  return from(this.supabase.rpc('get_articulo_empaque')).pipe(
    map(res => {
      if (res.error) throw res.error;

      return (res.data as any[]).map(item => {
        return {
          id: item.id,
          nombre: item.nombre,
          stock: item.stock,
          categoria: item.categoria,
          codigo: item.codigo,
          empaques: item.empaques, // El array de empaques que viene del RPC
          // Inicializamos el empaque por defecto y el precio
          empaqueSeleccionado: item.empaques[0],
          precio: item.empaques[0]?.precio || 0,
          cantidad: 1
        } as Producto;
      });
    })
  );
}
  /* otras manera de traer los datos
    getProductos(): Observable<Producto[]> { return from(this.client.rpc('obtiene_articulo')).pipe( map(res => res.data as Producto[]), catchError(err => { console.error('Error en RPC obtiene_articulo:', err); return throwError(() => err); }) ); }

  */

  //getProductos() { return this.http.get<Producto[]>(`${environment.apiUrl}/inventary`); }//revisar como se llama, sino es producto, creo es inventary
  //esto puede cambiarse por getproductos, apra qu se llame en el componente desde una consulta y no desde un rpc
  buscarProducto(valor: string) {
      return from( this.supabase.client
       .from('articulo')
       .select('*')
       .or(`nombre.ilike.%${valor}%,codigo.eq.${valor}`)
      ).pipe( map(res => {
        if (res.error) throw res.error;
          return res.data as Producto[];
        }) );
  }
  /*
  getSugerencias(valor: string): Producto[] {
   const termino = valor.toLowerCase();
   return this.productos.filter(p =>
    p.nombre.toLowerCase().includes(termino) ||
    p.codigo?.toString().includes(termino)
   ).slice(0, 5); // máximo 5 sugerencias
  }
*/
  
  //para crear la factura
  //crearFactura(datos: any) { return this.http.post(`${environment.apiUrl}/check-in`, datos); }
  crearFactura(datos: any) {
    return from( this.supabase.client.rpc('crear_factura1', {
      p_id_cliente:   datos.id_cliente,
      p_id_moneda:    datos.id_moneda,
      p_id_usuario:   datos.id_usuario,
      p_tipo_pago:    datos.tipo_pago,
      p_tipo_cambio:  datos.tipo_cambio,
      p_subtotal:     datos.subtotal,
      p_iva:          datos.iva,
      p_descuento:    datos.descuento,
      p_total:        datos.total,
      p_items:        datos.p_items,
      p_id_sucursal:  datos.id_sucursal // Tu JSONB con los productos
       })
     ).pipe( map(res => {
       if (res.error) throw res.error;
       return res.data; // { success: true, id: ... }
        }) );
  }

  obtenerTodos(): Observable<Cliente[]> {
  return from(this.supabase.client.rpc('obtener_clientes')).pipe(
    map(res => {
      if (res.error) {
        console.error('Error en RPC:', res.error);
        throw res.error;
      }
      return (res.data as any[]).map(item => {
        return {
          id: item.id,
          nombre: item.nombre,
          identificacion: item.identificacion
        } as Cliente;
      });
    })
  );
}

 /*
  buscarClientes(termino: string): Observable<any[]> {
  return from(
    this.supabase.client
      .from('cliente')
      .select('id, nombre, numero_ruc')
      .ilike('nombre', `%${termino}%`) // Busca coincidencias parciales
  ).pipe( map(res => {
        if (res.error) throw res.error;
          return res.data as Cliente[];
        }) );
  }
        */
  //generar pdf
  //descargarPDF(facturaId: number) { return this.http.get(`${environment.apiUrl}/factura/${facturaId}/pdf`, { responseType: 'blob' }); }
  /*
  getFacturaCompleta(facturaId: number) {
     return from( this.supabase.client
      .from('facturas')
      .select('id, cliente, total, detalles_factura(producto_id, cantidad, precio_unitario)')
      .eq('id', facturaId)
      .single()
     ).pipe( map(res => {
       if (res.error) throw res.error;
        return res.data;
       }) );
  }
  */
  getFacturaCompleta(facturaId: number) {
     return from( this.supabase.client.rpc('obtener_detalle_factura', { p_factura_id: facturaId })
     ).pipe(map(res => res.data));
     }
  // Crear factura y actualizar stock (equivalente a tu /facturar) otras forma
  /*
   crearFactura(datos: any): Observable<any> {
     return from( (async () => {
       // 1. Insertar la factura principal
         const { data: factura, error: errorFactura } = await this.supabase.client
        .from('facturas') .insert([{ cliente: datos.cliente, total: datos.total }])
        .select()
        .single();
         if (errorFactura) throw errorFactura;
          const facturaId = factura.id;
           // 2. Insertar detalles
            const detalles = datos.items.map((item: any) => ({
              factura_id: facturaId,
              producto_id: item.id,
              cantidad: item.cantidad,
              precio_unitario: item.precio
             }));
             const { error: errorDetalles } = await this.supabase.client
             .from('detalles_factura')
             .insert(detalles);
             if (errorDetalles) throw errorDetalles;
              // 3. Actualizar stock vía RPC
             for (const item of datos.items) {
              await this.supabase.client.rpc('descontar_stock', {
                 p_id: item.id,
                  p_cantidad: item.cantidad 
                });
               }
                return { success: true, id: facturaId };
               })()
               );
               }
*/
  logout() {
    return from(this.supabase.signOut());
  }
  

  
}
//import { createClient } from '@supabase/supabase-js';
/*
export default {
  async fetch(request: Request, env: any): Promise<Response> {
    //constructor(private supabase: SupabaseService) {}
    //const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
    const url = new URL(request.url);
    
    

    // 1. Inicializar cliente de Supabase
    //const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
    
    const corsHeaders = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // Manejar Preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // --------------------------------------------------------
    // POST: Obtener productos con stock
    // --------------------------------------------------------
    if (url.pathname === "/productos" && request.method === "POST") {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .gt('stock', 0);

      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });

      return new Response(JSON.stringify(data), { headers: corsHeaders });
    }

    // --------------------------------------------------------
    // POST: Crear factura y actualizar stock
    // --------------------------------------------------------
    if (url.pathname === "/facturar" && request.method === "POST") {
      const { cliente, items, total } = await request.json() as any;

      // 1. Insertar la factura principal
      const { data: factura, error: errorFactura } = await supabase
        .from('facturas')
        .insert([{ cliente, total }])
        .select()
        .single();

      if (errorFactura) return new Response(JSON.stringify({ error: errorFactura.message }), { status: 500, headers: corsHeaders });

      const facturaId = factura.id;

      // 2. Preparar los detalles para una inserción masiva (más eficiente que un loop)
      const detalles = items.map((item: any) => ({
        factura_id: facturaId,
        producto_id: item.id,
        cantidad: item.cantidad,
        precio_unitario: item.precio
      }));

      const { error: errorDetalles } = await supabase
        .from('detalles_factura')
        .insert(detalles);

      if (errorDetalles) return new Response(JSON.stringify({ error: errorDetalles.message }), { status: 500, headers: corsHeaders });

      // 3. Actualizar el stock
      // Nota: Supabase no tiene un "UPDATE SET stock = stock - X" masivo directo vía API. 
      // Lo ideal es hacerlo mediante una función RPC o uno por uno como hacías en D1:
      for (const item of items) {
        // Obtenemos el stock actual primero para restar (o usamos una RPC en Supabase)
        await supabase.rpc('descontar_stock', { 
          p_id: item.id, 
          p_cantidad: item.cantidad 
        });
      }

      return new Response(JSON.stringify({ success: true, id: facturaId }), { headers: corsHeaders });
    }

    return new Response("Not Found", { status: 404, headers: corsHeaders });
  }
  
}
  */
