import { Injectable } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
//import { from } from 'rxjs';
import { Producto } from '../interfaces/producto.interface';
import { Cliente } from '../interfaces/cliente.interface';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { createClient } from '@supabase/supabase-js';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import jsPDF from 'jspdf';

@Injectable({ providedIn: 'root' })
export class VentasHttpServices {
  constructor(
    private http: HttpClient,
    private supabase: SupabaseService,
  ) {}
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
      map((res) => {
        if (res.error) throw res.error;

        return (res.data as any[]).map((item) => {
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
            cantidad: 1,
          } as Producto;
        });
      }),
    );
  }
  /* otras manera de traer los datos
    getProductos(): Observable<Producto[]> { return from(this.client.rpc('obtiene_articulo')).pipe( map(res => res.data as Producto[]), catchError(err => { console.error('Error en RPC obtiene_articulo:', err); return throwError(() => err); }) ); }

  */

  //getProductos() { return this.http.get<Producto[]>(`${environment.apiUrl}/inventary`); }//revisar como se llama, sino es producto, creo es inventary
  //esto puede cambiarse por getproductos, apra qu se llame en el componente desde una consulta y no desde un rpc
  buscarProducto(valor: string) {
    return from(
      this.supabase.client
        .from('articulo')
        .select('*')
        .or(`nombre.ilike.%${valor}%,codigo.eq.${valor}`),
    ).pipe(
      map((res) => {
        if (res.error) throw res.error;
        return res.data as Producto[];
      }),
    );
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

  async obteneratributos() {
    const { data, error } = await this.supabase.client
    .from('vw_atributos')
    .select('nombre_atributo');
    if (error) {
      console.error('Error consulta obtener_atributo: ', error);
      return [];
    }
    return data; // Retorna array de strings: ['Color', 'Talla', 'Marca']
  }

  async buscarProductosFiltrados(filtros: {
    texto: string;
    atributo: string;
    valorAtributo: string;
    categoria: string;
  }) {
    let query = this.supabase.client
      .from('vw_var_articulo_empaque') // Recomendado usar una Vista
      .select('*');

    // 1. Filtro de Texto Libre (Nombre o Código)
    if (filtros.texto) {
      query = query.or(`nombre.ilike.%${filtros.texto}%,codigo.ilike.%${filtros.texto}%`);
    }

    // 2. Filtro de Atributo Dinámico (Talla, Color, etc.)
    // 2. FILTRO POR ATRIBUTO DINÁMICO (Usando la nueva columna JSONB)
   if (filtros.atributo && filtros.valorAtributo) {
    // Sintaxis de Supabase para filtrar dentro de JSONB: columna->>clave
    query = query.ilike(`atributos_json->>${filtros.atributo}`, `%${filtros.valorAtributo}%`);
   }

    // 3. Filtro de Categoría
    if (filtros.categoria && filtros.categoria !== 'Todos') {
      query = query.eq('categoria', filtros.categoria);
    }

    // Ordenamos y limitamos para rendimiento
    const { data, error } = await query.order('nombre', { ascending: true }).limit(100);

    if (error) {
      console.error('Error en búsqueda:', error);
      return [];
    }

    return data;
  }

async obtenerSugerenciasRapidas(texto: string, atributo: string, valorAttr: string) {
  if (!texto && !valorAttr) return [];

  let query = this.supabase.client
    .from('vw_var_articulo_empaque')
    .select('id, nombre, codigo, empaques, stock, categoria');

  if (texto) {
    query = query.or(`nombre.ilike.%${texto}%,codigo.ilike.%${texto}%`);
  }

  if (atributo && valorAttr) {
    query = query.ilike(`atributos_json->>${atributo}`, `%${valorAttr}%`);
  }

  const { data } = await query.limit(5); // Solo las primeras 5 sugerencias
  return data || [];
}

  //para crear la factura
  //crearFactura(datos: any) { return this.http.post(`${environment.apiUrl}/check-in`, datos); }
  crearFactura(datos: any) {
    return from(
      this.supabase.client.rpc('crear_factura1', {
        p_id_cliente: datos.id_cliente,
        p_id_moneda: datos.id_moneda,
        p_id_usuario: datos.id_usuario,
        p_tipo_pago: datos.tipo_pago,
        p_tipo_cambio: datos.tipo_cambio,
        p_subtotal: datos.subtotal,
        p_iva: datos.iva,
        p_descuento: datos.descuento,
        p_total: datos.total,
        p_items: datos.p_items,
        p_id_sucursal: datos.id_sucursal, // Tu JSONB con los productos
      }),
    ).pipe(
      map((res) => {
        if (res.error) throw res.error;
        return res.data; // { success: true, id: ... }
      }),
    );
  }

  obtenerTodos(): Observable<Cliente[]> {
    return from(this.supabase.client.rpc('obtener_clientes')).pipe(
      map((res) => {
        if (res.error) {
          console.error('Error en RPC:', res.error);
          throw res.error;
        }
        return (res.data as any[]).map((item) => {
          return {
            id: item.id,
            nombre: item.nombre,
            identificacion: item.identificacion,
          } as Cliente;
        });
      }),
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
    return from(
      this.supabase.client.rpc('obtener_detalle_factura', { p_factura_id: facturaId }),
    ).pipe(map((res) => res.data));
  }
  generarTicketPro(factura: any) {
      // Aumentamos el alto dinámico: cada item ahora puede ocupar unas 3 líneas (aprox 12mm)
      const altoDinamico = 110 + (factura.items.length * 12); 
      const doc = new jsPDF('p', 'mm', [80, altoDinamico]);
  
      // 1. Encabezado
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('COMERCIAL JAZMIN', 40, 10, { align: 'center' });
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('RUC: 0012605900001X', 40, 14, { align: 'center' });
      doc.text('Chinandega, Nicaragua', 40, 18, { align: 'center' });
  
      // 2. Info de Factura
      doc.text(`Factura: # ${factura.id}`, 5, 25);
      doc.text(`Fecha: ${new Date().toLocaleString()}`, 5, 29);
      doc.text(`Cliente: ${factura.cliente?.nombre || 'Comercial Jazmin'}`, 5, 33);
      doc.text('-'.repeat(45), 5, 37);
  
      // 3. Detalle de Productos
      let y = 42;
      doc.setFontSize(8);
      
      factura.items.forEach((item: any) => {
          // Línea 1: Nombre + Marca
          const descripcionPrincipal = `${item.nombre} ${item.marca ? '[' + item.marca + ']' : ''}`;
          doc.setFont('helvetica', 'bold');
          doc.text(descripcionPrincipal.substring(0, 35), 5, y);
          
          // Línea 2: Subcategoría y Atributos (Color, Talla, etc.)
          y += 4;
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7);
          const detalles = `${item.subcategoria || ''} | ${item.color || ''} | Talla: ${item.talla || 'N/A'}`;
          doc.text(detalles, 5, y);
  
          // Línea 3: Cantidad, Precio Unitario y Subtotal de línea
          y += 4;
          doc.setFontSize(8);
          const subtotalLinea = item.cantidad * item.precio_unitario;
          doc.text(`${item.cantidad} x C$ ${item.precio_unitario.toFixed(2)}`, 5, y);
          doc.text(`C$ ${subtotalLinea.toFixed(2)}`, 75, y, { align: 'right' });
          
          y += 6; // Espacio entre productos
      });
  
      // 4. Totales
      y += 2;
      doc.text('-'.repeat(45), 5, y);
      
      doc.setFontSize(9);
      const labelX = 40;
      const valueX = 75;
  
      y += 5;
      doc.text('SUBTOTAL:', labelX, y);
      doc.text(`C$ ${factura.subtotal.toFixed(2)}`, valueX, y, { align: 'right' });
  
      y += 5;
      doc.text('IVA (15%):', labelX, y);
      doc.text(`C$ ${(factura.iva).toFixed(2)}`, valueX, y, { align: 'right' });
  
      if (factura.descuento > 0) {
          y += 5;
          doc.text('DESCUENTO:', labelX, y);
          doc.text(`- C$ ${factura.descuento_total.toFixed(2)}`, valueX, y, { align: 'right' });
      }
  
      y += 6;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('TOTAL A PAGAR:', labelX, y);
      doc.text(`C$ ${factura.total.toFixed(2)}`, valueX, y, { align: 'right' });
  
      // 5. Pago y Cambio
      y += 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text('RECIBIDO:', labelX, y);
      doc.text(`C$ ${(factura.montoPagado || 0).toFixed(2)}`, valueX, y, { align: 'right' });
  
      y += 5;
      doc.setFont('helvetica', 'bold');
      doc.text('CAMBIO:', labelX, y);
      doc.text(`C$ ${(factura.cambio || 0).toFixed(2)}`, valueX, y, { align: 'right' });
  
      // 6. Pie de página
      y += 12;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text('¡Gracias por su compra!', 40, y, { align: 'center' });
      doc.text('No se aceptan devoluciones después de 24h', 40, y + 4, { align: 'center' });
  
      // Salida del PDF (Mantenemos tu lógica de ventana derecha)
      const pdfBlob = doc.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      const windowFeatures = `width=400,height=600,left=${window.screen.width - 400},top=0,menubar=no,toolbar=no`;
      
      const nuevaVentana = window.open(url, 'TicketVenta', windowFeatures);
      if (!nuevaVentana) {
          const link = document.createElement('a');
          link.href = url;
          link.target = '_blank';
          link.click();
      }
    }
  /*
  generarTicketPro(factura: any) {
  const altoDinamico = 100 + (factura.items.length * 5); 
      const doc = new jsPDF('p', 'mm', [80, altoDinamico]);
      //const doc = new jsPDF('p', 'mm', [80, 150]); // 80mm de ancho
  
      // 1. Encabezado
      doc.setFontSize(14);
      doc.text('INTIMIDADES JAZMIN', 40, 10, { align: 'center' });
      doc.setFontSize(8);
      doc.text('RUC: 0012605900001X', 40, 14, { align: 'center' });
      doc.text('Chinandega, Nicaragua', 40, 18, { align: 'center' });
  
      // 2. Info de Factura
      doc.text(`Factura: # ${factura.id}`, 5, 25);
      doc.text(`Fecha: ${new Date().toLocaleString()}`, 5, 29);
      doc.text(`Cliente: ${factura.cliente.nombre}`, 5, 33);
      doc.text('-'.repeat(45), 5, 37);
  
      // 3. Detalle de Productos
      let y = 42;
      factura.items.forEach((item: any) => {
        //doc.text(`${item.cantidad} x ${item.nombre.substring(0, 20)}`, 5, y);
        //doc.text(`C$ ${(item.precio * item.cantidad).toFixed(2)}`, 75, y, { align: 'right' });
        doc.text(`${item.producto.substring(0, 15)}`, 5, y);
        doc.text(`x${item.cantidad}`, 50, y);
        doc.text(`${item.precio_unitario}`, 65, y, { align: 'right' });
        y += 5;
      });
  
      // 4. Totales
      y += 5;
      doc.text('-'.repeat(45), 5, y);
      y += 5;
      doc.text('SUBTOTAL:', 45, y);
      doc.text(`C$ ${factura.subtotal.toFixed(2)}`, 75, y, { align: 'right' });
  
      y += 5;
      doc.setFont('helvetica', 'bold');
      doc.text('TOTAL A PAGAR:', 45, y);
      doc.text(`C$ ${factura.total.toFixed(2)}`, 75, y, { align: 'right' });
  
      // 5. Pie de página
      y += 10;
      doc.setFontSize(7);
      doc.text('¡Gracias por su compra!', 40, y, { align: 'center' });
  
      // Abrir en ventana independiente
      //const url = URL.createObjectURL(doc.output('blob'));
      //window.open(url, '_blank', 'width=450,height=600');
      const pdfBlob = doc.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      const width = 400;
      const height = 600;
      const left = window.screen.width - width; // Aparece a la derecha
      const top = 0;
      const windowFeatures = `
      width=${width},
      height=${height},
      left=${left},
      top=${top},
      menubar=no,
      toolbar=no,
      location=no,
      status=no,
      resizable=yes,
      scrollbars=yes
    `;
      const nuevaVentana = window.open(url, 'TicketVenta', windowFeatures);
      if (nuevaVentana) {
        nuevaVentana.focus();
      } else {
        // Si el navegador lo bloquea, cae de espaldas al método del link que ya tenías
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.click();
      }
  }
  */
  /*
  generarTicketPro(factura: any) {
      const altoDinamico = 100 + (factura.items.length * 5); 
      const doc = new jsPDF('p', 'mm', [80, altoDinamico]);
      //const doc = new jsPDF('p', 'mm', [80, 150]); // 80mm de ancho
  
      // 1. Encabezado
      doc.setFontSize(14);
      doc.text('INTIMIDADES JAZMIN', 40, 10, { align: 'center' });
      doc.setFontSize(8);
      doc.text('RUC: 0012605900001X', 40, 14, { align: 'center' });
      doc.text('Chinandega, Nicaragua', 40, 18, { align: 'center' });
  
      // 2. Info de Factura
      doc.text(`Factura: # ${factura.id}`, 5, 25);
      doc.text(`Fecha: ${new Date().toLocaleString()}`, 5, 29);
      doc.text(`Cliente: ${factura.cliente.nombre}`, 5, 33);
      doc.text('-'.repeat(45), 5, 37);
  
      // 3. Detalle de Productos
      let y = 42;
      factura.items.forEach((item: any) => {
        //doc.text(`${item.cantidad} x ${item.nombre.substring(0, 20)}`, 5, y);
        //doc.text(`C$ ${(item.precio * item.cantidad).toFixed(2)}`, 75, y, { align: 'right' });
        doc.text(`${item.producto.substring(0, 15)}`, 5, y);
        doc.text(`x${item.cantidad}`, 50, y);
        doc.text(`${item.precio_unitario}`, 65, y, { align: 'right' });
        y += 5;
      });
  
      // 4. Totales
      y += 5;
      doc.text('-'.repeat(45), 5, y);
      y += 5;
      doc.text('SUBTOTAL:', 45, y);
      doc.text(`C$ ${factura.subtotal.toFixed(2)}`, 75, y, { align: 'right' });
  
      y += 5;
      doc.setFont('helvetica', 'bold');
      doc.text('TOTAL A PAGAR:', 45, y);
      doc.text(`C$ ${factura.total.toFixed(2)}`, 75, y, { align: 'right' });
  
      // 5. Pie de página
      y += 10;
      doc.setFontSize(7);
      doc.text('¡Gracias por su compra!', 40, y, { align: 'center' });
  
      // Abrir en ventana independiente
      //const url = URL.createObjectURL(doc.output('blob'));
      //window.open(url, '_blank', 'width=450,height=600');
      const pdfBlob = doc.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      const width = 400;
      const height = 600;
      const left = window.screen.width - width; // Aparece a la derecha
      const top = 0;
      const windowFeatures = `
      width=${width},
      height=${height},
      left=${left},
      top=${top},
      menubar=no,
      toolbar=no,
      location=no,
      status=no,
      resizable=yes,
      scrollbars=yes
    `;
      const nuevaVentana = window.open(url, 'TicketVenta', windowFeatures);
      if (nuevaVentana) {
        nuevaVentana.focus();
      } else {
        // Si el navegador lo bloquea, cae de espaldas al método del link que ya tenías
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.click();
      }
    }
    */
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
