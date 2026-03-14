import { Component, OnInit, ElementRef, ViewChild,ChangeDetectorRef } from '@angular/core';
import { TextComponent } from '../components/Text/text.component';
import { ProductImagesComponent } from './product-imgs/product-imgs.component';
import { ProductColorsComponent } from './product-colors/product-colors.component';
import { ProductSizesComponent } from './product-sizes/product-sizes.component';
import { VentasHttpServices } from '../check-in/services/ventas-https.services';
import { Router } from '@angular/router';
import { Producto } from './interfaces/producto.interface';
import { FormsModule } from '@angular/forms'; // Necesario para ngModel
import jsPDF from 'jspdf';
//import autoTable from 'jspdf-autotable';
import { CurrencyPipe,TitleCasePipe } from '@angular/common'; // 1. Importa el pipe
import { AuthService } from '../login/services/auth.service';
//import { ClientesService } from './services/clientes.service';
import { Cliente } from './interfaces/cliente.interface';
import { from } from 'rxjs'; // Importante importar 'from'
import { ClienteComponent } from './clientes/cliente.component';


//import * as QRCode from 'qrcode'; //falta instalar npm install qrcode

@Component({
  selector: 'check-in',
  standalone: true,
  templateUrl: './check-in.component.html',
  styleUrl: './check-in.component.scss',
  imports: [FormsModule, CurrencyPipe,TitleCasePipe,ClienteComponent], //estos estaban importados TextComponent, ProductImagesComponent, ProductColorsComponent, ProductSizesComponent,
})
export class CheckInComponent implements OnInit {
  //constructor() {}

  //export class Facturacion {
  productos: Producto[] = [];
  carrito: Producto[] = [];
  cliente: string = '';
  total: number = 0;
  subtotal: number = 0;
  iva: number = 0; //esto aun no lo pongo
  totalFactura: number = 0;
  aplicaIVA: boolean = false;
  readonly IVA_RATE = 0.15;
  descuentoGlobal: number = 0; // Por defecto cero
  // Agrega estas variables
  buscarpro: string = '';
  //variable para categorias
  // Nuevas variables
  categorias: string[] = ['Todas'];
  categoriaSeleccionada: string = 'Todas';
  // Variables de control para paginar
  paginaActual: number = 1;
  itemsPorPagina: number = 9; // 3x3 para que se vea bien en grid
  //variables apra imprimir pdf carrgand y mostrar error
  cargando = false; // Para mostrar spinner
  errorMsg = ''; // Para mostrar errores
  //para autocompletado
  sugerencias: Producto[] = [];
  //productoSeleccionado: Producto | null = null; // objeto del producto
  productoSeleccionado: any = null;
  cantidadSeleccionada: string = '1';
  busqueda = '';
  @ViewChild('cantidadModal') cantidadModal!: ElementRef;
  @ViewChild('pagoModal') pagoModal!: ElementRef;
  private modalInstance: any; // Variable para guardar la instancia modal pago
  @ViewChild('cantidadInput') cantidadInput!: ElementRef;
  //esto es para abrir el modald e clientes desde facturacion tambien tuve que importarlo
  @ViewChild('modalClientes') modalClientes!: ClienteComponent;
  // Variables en tu componente
  montoRecibido: number = 0;
  cambio: number = 0;
  monedaPago: string = 'NIO';
  metodoPago: string = 'Efectivo';
  tasaCambio: number = 36.25; // Traer esto de tu DB o servicio
  //para buscar cliantes
  buscarCli: string = '';
  sugerenciasClientes: Cliente[] = [];
  clienteSeleccionado: any = null;
  listaclientes: Cliente[] = [];
  //para tributos
  // Variables necesarias
  listaAtributos: any[] = [];
  atributoFiltro: string = '';
  valorAtributo: string = '';
  private debounceTimer?: any;

  constructor(
    private service: VentasHttpServices,
    private router: Router,
    private usuarioauth: AuthService,
    private cdr: ChangeDetectorRef
  ) {} //el router se ocupa para navegar a pagnas, router.navigate

  ngOnInit() {
    //this.service.getProductos().subscribe(res => this.productos = res);
    this.cargarDatosIniciales();
    from(this.service.obteneratributos()).subscribe((attr) => {
      this.listaAtributos = attr;
    });

    this.service.getProductos().subscribe((res) => {
      this.productos = res;
      const cats = [...new Set(res.map((p) => p.categoria))]; // Extrae nombres únicos
      this.categorias = ['Todas', ...cats];
    });
  }

  get productosFiltrados() {
    return this.productos.filter((p) => {
      const termino = this.buscarpro.toLowerCase();
      const coincideNombre = p.nombre.toLowerCase().includes(termino);
      const coincideCodigo = p.codigo?.toString().includes(termino);
      const coincideCat =
        this.categoriaSeleccionada === 'Todas' || p.categoria === this.categoriaSeleccionada;
      return (coincideNombre || coincideCodigo) && coincideCat;
    });
  }

  /*
  // Cambia la lógica de filtrado
  get productosFiltrados() {
    return this.productos.filter(p => {
    const coincideNombre = p.nombre.toLowerCase().includes(this.buscarpro.toLowerCase());
    const coincideCat = this.categoriaSeleccionada === 'Todas' || p.categoria  === this.categoriaSeleccionada;
    const coincideCodigo = p.codigo?.toString().includes(this.buscarpro);
    //return coincideNombre && coincideCat; //esto es para buscar por nombre y categoria
    return (coincideNombre || coincideCodigo) && coincideCat; //esto ya agrega al codigo
  });
  }
  */

  // 2. Luego cortamos el resultado para la página actual
  get productosPaginados() {
    // const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    // const fin = inicio + this.itemsPorPagina;
    // return this.productosFiltrados.slice(inicio, fin);

    // 3. Calcular el índice inicial y final para el recorte (Slice)
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;

    // 4. "Cortar" el array principal para obtener solo los de la página actual
    return this.productos.slice(inicio, fin);
  }

  get totalPaginas() {
    //return Math.ceil(this.productosFiltrados.length / this.itemsPorPagina);
    return Math.ceil(this.productos.length / this.itemsPorPagina);
  }

  cambiarPagina(nueva: number) {
    if (nueva >= 1 && nueva <= this.totalPaginas) {
      this.paginaActual = nueva;
    }
  }

  actualizarPaginacion() {
    // 1. Calcular el total de páginas basándonos en los resultados del filtro
    this.totalPaginas;

    // 2. Controlar que la página actual no sea mayor al total (por si un filtro reduce mucho los resultados)
    if (this.paginaActual > this.totalPaginas) {
      this.paginaActual = 1;
    }
  }

  seleccionarCategoria(cat: string) {
    this.categoriaSeleccionada = cat;
  }
  /*
  get productosFiltrados() {
  if (!this.buscarpro) {
    return this.productos;
  }
  return this.productos.filter(p => 
    p.nombre.toLowerCase().includes(this.buscarpro.toLowerCase())
  );
  }
  */

  limpiarFiltros() {
  this.buscarpro = '';
  this.atributoFiltro = '';
  this.valorAtributo = '';
  this.categoriaSeleccionada = 'Todos';
  this.onBuscarChange();
  }

  async onBuscarChange() {
    // 1. Limpiamos el timer anterior
  if (this.debounceTimer) clearTimeout(this.debounceTimer);

   if (this.buscarpro.length > 1 || this.valorAtributo.length > 1) {
    this.debounceTimer = setTimeout(async () => {
      const res = await this.service.obtenerSugerenciasRapidas(
        this.buscarpro, 
        this.atributoFiltro, 
        this.valorAtributo
      );

      // MAPEAMOS AQUÍ PARA EVITAR EL ERROR DE TIPO
      this.sugerencias = res.map((s: any) => ({
        ...s,
        precio: s.empaques?.[0]?.precio || 0, // Tomamos el precio del primer empaque
        descuentoPorLinea: 0,                // Inicializamos en 0
        empaqueSeleccionado: s.empaques?.[0] || null
      })) as Producto[]; // Ahora sí es compatible con Producto[]
      
    }, 300);
   } else {
    this.sugerencias = [];
    }
    // Empaquetamos los filtros
    const parametros = {
      texto: this.buscarpro,
      atributo: this.atributoFiltro,
      valorAtributo: this.valorAtributo,
      categoria: this.categoriaSeleccionada,
    };

    // Llamamos al servicio
    const resultados = await this.service.buscarProductosFiltrados(parametros);

    // Asignamos los datos y reseteamos paginación
    this.productos = resultados;
    this.paginaActual = 1;
    this.actualizarPaginacion(); // Tu función que corta el array para la vista
  }

  /*
  onBuscarChange() {
  if (this.buscarpro.length > 0) {
    this.sugerencias = this.productos.filter(p =>
      p.nombre.toLowerCase().includes(this.buscarpro.toLowerCase()) ||
      p.codigo.toString().includes(this.buscarpro)
    ).slice(0, 5);
    
  } else {
    this.sugerencias = [];
  }
}
*/ //esto es agregar carrito actual, es seleccionando el producto
  seleccionarProducto(prod: Producto) {
    // 1. Limpiamos buscador y sugerencias inmediatamente
    this.buscarpro = '';
    this.sugerencias = [];
    //esto apra validar que este en cero
      const stockDisponible = prod.stock || 0;
    if (stockDisponible <= 0) {
    this.mostrarToast('Agotado'); // O un alert: "Producto agotado"
    console.warn(`Intento de agregar ${prod.nombre} sin stock.`);
    return; // Detenemos la función aquí
    }
    // 2. (Opcional) Validar si ya está en el carrito y si excederá el stock
    const itemEnCarrito = this.carrito.find(item => item.id === prod.id);
    if (itemEnCarrito && (itemEnCarrito.cantidad ?? 0 + 1) > stockDisponible) {
    alert("No puedes agregar más de lo que hay en existencia.");
    this.mostrarToast('Agotado'); // Mensaje de "No hay más unidades"
    return;
    }

    // 2. Verificamos si el producto ya está en el carrito para no repetirlo
    const index = this.carrito.findIndex((item) => item.id === prod.id);

    if (index !== -1) {
      // Si ya existe, solo aumentamos la cantidad
      this.carrito[index].cantidad = (this.carrito[index].cantidad ?? 0) + 1;
    } else {
      // Si es nuevo, lo preparamos con sus valores iniciales
      const nuevoItem: Producto = {
        ...prod,
        cantidad: 1, // Cantidad inicial por defecto
        empaqueSeleccionado: prod.empaques[0], // Primer empaque de la lista
        precio: prod.empaques[0]?.precio ?? 0, // Precio de ese empaque
      };

      this.carrito.push(nuevoItem);
      
    }
    this.calcularTotal();
  }

  /*
  
  seleccionarProducto(prod: Producto) {
   this.buscarpro = prod.nombre;
   this.sugerencias = [];
   // Aquí puedes abrir el modal de cantidad directamente
   this.productoSeleccionado = prod;
   this.cantidadSeleccionada = '';
   const modalElement = document.getElementById('cantidadModal'); 
   if (modalElement) { 
    //const modal = new (window as any).bootstrap.Modal(modalElement);
    const modal = new (window as any).bootstrap.Modal(this.cantidadModal.nativeElement);
     modal.show();
     setTimeout(() => { if (this.cantidadInput) { this.cantidadInput.nativeElement.focus(); } }, 300);//para poner el cursor
     } else {
      console.error('No se encontró el modal en el DOM');
      }
   
  }
*/
  /*
  buscarProducto() {
    this.service.buscarProducto(this.buscarpro).subscribe({
      next: productos => {
        this.sugerencias = productos;
       }
    });
  }
    */
  /*
  buscarProducto() {
  this.service.buscarProducto(this.buscarpro).subscribe({ //esto tenia this.busqueda en vez de this.buscarpro
    next: producto => {
      if (producto) {
        this.productoSeleccionado = producto;
        this.cantidadSeleccionada = '';
        const modal = new (window as any).bootstrap.Modal(document.getElementById('cantidadModal'));
        modal.show();
      }
    }
  });
}
*/
  agregarNumero(num: number) {
    this.cantidadSeleccionada += num.toString();
  }

  borrarCantidad() {
    this.cantidadSeleccionada = this.cantidadSeleccionada.slice(0, -1);
  }

  confirmarCantidad() {
    let cantidad = parseInt(this.cantidadSeleccionada || '1', 10);

    if (!this.productoSeleccionado) {
      console.error('No hay producto seleccionado');
      return;
    }

    if (cantidad > this.productoSeleccionado.stock) {
      cantidad = this.productoSeleccionado.stock;
      this.productoSeleccionado.mensajeStock = `Máximo disponible: ${this.productoSeleccionado.stock}`;
    } else {
      this.productoSeleccionado.mensajeStock = '';
    }

    const existente = this.carrito.find((p) => p.id === this.productoSeleccionado.id);

    if (existente) {
      existente.cantidad = (existente.cantidad ?? 0) + cantidad;
    } else {
      this.carrito.push({
        ...this.productoSeleccionado,
        cantidad,
      });
    }

    this.calcularTotal();

    // Cierra el modal después de confirmar
    //const modal = new (window as any).bootstrap.Modal(this.cantidadModal.nativeElement);
    //modal.hide();
  }
  /*
  recalcularTotal() {
    this.subtotal = this.carrito.reduce((acc, item) => acc + item.precio * (item.cantidad || 1), 0);

    //this.total = this.carrito.reduce((acc, item) => acc + (item.precio * (item.cantidad || 1)), 0);
    //const subtotal = this.calcularSubtotal();
    const iva = this.calcularIVA();

    // El total es: (Subtotal + IVA) - Descuento
    this.total = this.subtotal + iva - (this.descuentoGlobal || 0);

    return Number(this.total.toFixed(2));
  }
  */
  manejarTeclado(event: KeyboardEvent) {
    const key = event.key;

    if (!isNaN(Number(key))) {
      // Si es número, lo agrega
      this.cantidadSeleccionada += key;
    } else if (key === 'Backspace') {
      // Borra último dígito
      this.cantidadSeleccionada = this.cantidadSeleccionada.slice(0, -1);
    } else if (key === 'Enter') {
      // Confirma con Enter
      this.confirmarCantidad();
    }
  }
  /*
  agregarAlCarrito(prod: Producto) {
    const item = { ...prod, cantidad: 1 };
    this.carrito.push(item);
    this.calcularTotal();
  }
    */

  // Al agregar un producto al carrito
  agregarAlCarrito(producto: Producto) {
    const stockDisponible = producto.stock || 0;
    if (stockDisponible <= 0) {
    this.mostrarToast('errorStock'); // O un alert: "Producto agotado"
    console.warn(`Intento de agregar ${producto.nombre} sin stock.`);
    return; // Detenemos la función aquí
    }
    // 2. (Opcional) Validar si ya está en el carrito y si excederá el stock
    const itemEnCarrito = this.carrito.find(item => item.id === producto.id);
    if (itemEnCarrito && (itemEnCarrito.cantidad ?? 0 + 1) > stockDisponible) {
    alert("No puedes agregar más de lo que hay en existencia.");
    return;
    }
    // Por defecto seleccionamos el primer empaque disponible
    const nuevoItem = {
      ...producto,
      empaqueSeleccionado: producto.empaques[0],
      cantidad: 1,
    };
    this.carrito.push(nuevoItem);
    this.calcularTotal();
  }

  //calculael total de la acturacion
  calcularTotal() {
    this.subtotal = this.carrito.reduce((acc, item) => acc + item.precio * (item.cantidad || 1), 0);

    //this.total = this.carrito.reduce((acc, item) => acc + (item.precio * (item.cantidad || 1)), 0);
    //const subtotal = this.calcularSubtotal();
    const iva = this.calcularIVA();

    // El total es: (Subtotal + IVA) - Descuento
    this.total = this.subtotal + iva - (this.descuentoGlobal || 0);

    return Number(this.total.toFixed(2));
  }

  // Esta función se dispara con el (change) del select
  actualizarPrecio(index: number) {
    const item = this.carrito[index];
    console.log(
      `Cambiado a ${item.empaqueSeleccionado?.nombre_empaque || 0}, nuevo precio: ${item.empaqueSeleccionado?.precio || 0}`,
    );
    // Aquí podrías disparar cálculos adicionales de impuestos si es necesario
    this.calcularTotal();
  }

  actualizarFila(item: Producto) {
    if (item.empaqueSeleccionado) {
      // 1. Actualizamos el precio base de la fila con el precio del empaque elegido
      item.precio = item.empaqueSeleccionado.precio;

      // 2. Recalculamos el subtotal inmediatamente
      //this.subtotal = item.precio * (item.cantidad || 1);//aqui tenia el subtotal this.intem, esto me obligaria a ponerlo en producto
      this.calcularTotal();
    }
    
  }

  onBuscarCliente() {
    // Limpiamos la selección actual si el usuario empieza a borrar/escribir
    this.clienteSeleccionado = null;

    const termino = this.buscarCli?.trim().toLowerCase();

    // 2. Si hay texto, filtramos el arreglo local
    if (termino && termino.length > 0) {
      this.sugerenciasClientes = this.listaclientes
        .filter(
          (clienteb) =>
            //console.log(clienteb,termino);
            //const ruc = String(clienteb.identificacion || '');
            // Buscamos coincidencia en nombre o identificación
            clienteb.nombre.toLowerCase().includes(termino) ||
            clienteb.identificacion.toLowerCase().includes(termino),
        )
        .slice(0, 10); // Limitamos a 10 para que la lista no sea gigante
    } else {
      this.sugerenciasClientes = [];
    }
  }

  /*
  onBuscarCliente() {
    this.clienteSeleccionado = null;
    if (!this.buscarCli || this.buscarCli.trim() === '') {
    this.clienteSeleccionado = null;
    this.sugerenciasClientes = [];
    return; 
  }
  //logica normal
  if (this.buscarCli.length > 2) {
    this.clienteservice.buscarClientes(this.buscarCli).subscribe(data => {
      this.sugerenciasClientes = data;
    });
  } else {
    this.sugerenciasClientes = [];
  }
}
*/
  seleccionarCliente(cli: Cliente) {
    this.clienteSeleccionado = cli;
    this.buscarCli = cli.nombre; // Ponemos el nombre en el input
    this.sugerenciasClientes = []; // Cerramos las sugerencias
  }

  //para cargar un cliente siempre
  cargarDatosIniciales() {
    this.service.obtenerTodos().subscribe({
      next: (data) => {
        this.listaclientes = data;

        // Buscamos automáticamente al Consumidor Final para dejarlo seleccionado
        const predeterminado = data.find((c) =>
          c.nombre.toLowerCase().includes('jazmin'),
        );

        if (predeterminado) {
          
          // 1. Asignamos la referencia
        this.clienteSeleccionado = predeterminado; 
        
        // 2. Ejecutamos tu función de selección para llenar variables
        this.seleccionarCliente(predeterminado);

        // 3. Forzamos a Angular a detectar que el valor cambió
        this.cdr.detectChanges();
        }
      },
      error: (err) => console.error('Error cargando clientes:', err),
    });
  }

  calcularIVA(): number {
    if (!this.aplicaIVA) return 0; // Si el switch está apagado, el IVA es cero

    const totalIVA = this.carrito.reduce((acc, item) => {
      const precio = item.empaqueSeleccionado?.precio || 0;
      const cantidad = item.cantidad || 0;
      return acc + precio * cantidad * this.IVA_RATE;
    }, 0);

    return Number(totalIVA.toFixed(2));
  }

  // Esta función asegura que el descuento sea válido mientras el usuario escribe
  validarDescuento() {
    if (this.descuentoGlobal < 0) {
      this.descuentoGlobal = 0;
    }

    // El máximo permitido es el subtotal + iva
    const maximo = this.calcularTotal();

    if (this.descuentoGlobal > maximo) {
      this.descuentoGlobal = maximo;
    }
  }
  /*
  abrirModalPago() {
  // 1. Calculamos el total antes de abrir para estar seguros
  this.totalFactura = this.total;
  
  // 2. Reiniciamos variables del modal para que esté limpio
  this.montoRecibido = 0;
  this.cambio = 0;

  // 3. Llamamos al modal usando la instancia de Bootstrap
  const modalElement = this.pagoModal.nativeElement;
  const modal = new (window as any).bootstrap.Modal(modalElement);
  modal.show();
  
  // Opcional: Poner foco automático en el input de "Efectivo Recibido"
  setTimeout(() => {
    const input = modalElement.querySelector('input[type="number"]');
    if (input) input.focus();
  }, 500);
}
*/

  abrirModalPago() {
    // 1. Cálculos iniciales
    this.totalFactura = this.total;
    this.montoRecibido = 0;
    this.cambio = 0;
    //this.descuentoGlobal = 0; // Importante resetear el descuento que añadimos

    // 2. Controlar la instancia para que no se duplique el fondo oscuro
    if (!this.modalInstance) {
      this.modalInstance = new (window as any).bootstrap.Modal(this.pagoModal.nativeElement, {
        backdrop: 'static', // Evita que se cierre al hacer clic afuera si prefieres seguridad
        focus: true,
      });
    }

    // 3. Mostrar
    this.modalInstance.show();

    // 4. Foco automático mejorado
    setTimeout(() => {
      const input = this.pagoModal.nativeElement.querySelector('#inputMontoRecibido');
      if (input) input.focus();
    }, 400);
  }

  // Función para cerrar correctamente
  cerrarModal() {
    if (this.modalInstance) {
      this.modalInstance.hide();
    }
  }
  //termina la venta o sea procesar pago
   finalizarVenta() {
    const usuarioActivo = this.usuarioauth.getCurrentUser();

    if (!usuarioActivo) {
      this.mostrarToast('errorUsuario'); // O un aviso de que la sesión expiró
      return;
    }

    const itemsProcesados = this.carrito.map((item) => {
      // Calculamos el precio total de esta línea (sin IVA, el IVA es global o por factura)
      const precioUnitario = item.empaqueSeleccionado?.precio || 0;
      const cant = item.cantidad || 0;
      const desc = item.descuentoPorLinea || 0; // Si tienes descuento por producto

      return {
        id_articulo_variante: item.id, // O el ID de la variante que tengas
        cantidad_empaque: item.empaqueSeleccionado?.unidades_empaque || 1,
        cantidad: cant,
        precio_venta: precioUnitario,
        descuento: desc,
        precio_total: precioUnitario * cant - desc,
      };
    });

    const payload = {
      //   cliente_id: this.clienteSeleccionado?.id,
      // total: this.totalFactura,
      // items: this.carrito,
      // metodo_pago: this.metodoPago,
      // moneda: this.monedaPago,
      // monto_recibido: this.montoRecibido,
      // cambio: this.cambio,
      // usuario_id: usuarioActivo.id, // ID del cajero
      // tasa_cambio: this.tasaCambio
      id_cliente: this.clienteSeleccionado?.id,
      id_usuario: usuarioActivo.id,
      id_moneda: 1, // Ejemplo: 1 para Córdoba
      tipo_pago: this.metodoPago, // 'Efectivo', 'Tarjeta'
      tipo_cambio: this.tasaCambio,
      subtotal: this.subtotal,
      iva: this.calcularIVA(),
      descuento: this.descuentoGlobal,
      total: this.total,
      p_items: itemsProcesados, //this.carrito, // Supabase recibe el JSONB directamente
      id_sucursal: 1, // ID de tu sucursal actual
    };
    this.cargando = true;
    this.errorMsg = '';

    this.service.crearFactura(payload).subscribe({
      next: (res: any) => {
        this.mostrarToast('ventaToast'); // Éxito //alert('Venta exitosa');
        const facturaId = res.id;
        // Generamos el PDF usando el ID que nos devolvió el Worker
        this.cerrarModal();
        // Reiniciamos estado
          this.ejecutarLimpiezaTotal();
        //  this.carrito = [];
        // this.cliente = '';
        // this.total = 0;
        // this.subtotal=0;
        //this.ngOnInit(); // Recargar stock
        // Traer datos completos de la factura
        //this.cdr.detectChanges();
        this.service.getFacturaCompleta(facturaId).subscribe((factura) => {
          //this.generarPDFRollpaper(factura); });
          this.generarTicketPro(factura);
          
        });
        
        //this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al procesar la venta:', err); ///alert('Error al procesar la venta')
        this.errorMsg = 'Error al procesar la venta. Intente nuevamente.';
        this.mostrarToast('errorToast'); // Error
      },
      complete: () => {
        this.cargando = false;
      },
    });
  }

   ejecutarLimpiezaTotal() {
    // Limpiar arreglo del carrito
    this.carrito = [];
    //this.clienteSeleccionado = null;

    this.descuentoGlobal = 0;
    this.aplicaIVA = false;
    //this.carrito = [];

    // Limpiar totales
    this.total = 0;
    this.subtotal = 0;
    this.iva = 0;

    //esta prueba para ver sino se pega
    this.cargarDatosIniciales();

    // 5. Refrescar visualmente la pantalla
    this.cdr.detectChanges();
    // Limpiar cliente seleccionado
    //this.clienteSeleccionado = null;
    //this.buscarCli = ''; // Limpia el input de texto del cliente

    
    // Si usas un buscador (input), límpialo también
    // if (this.inputBusqueda) {
    //   this.inputBusqueda.nativeElement.value = '';
    // }

    // // Si usas formularios reactivos para el pago
    // this.pagoModal?.reset({
    //   montoRecibido: 0,
    //   metodoPago: 'Efectivo'
    // });

    console.log('Interfaz reseteada correctamente.');
  }

  //esto para eliminr producto del carrito
  eliminarDelCarrito(index: number) {
    this.carrito.splice(index, 1);
    this.calcularTotal();
  }
  //esto para validar si el producto existe
  validarStock(item: Producto) {
    if (item.cantidad! > item.stock) {
      alert(`Solo hay ${item.stock} unidades disponibles de ${item.nombre}`);

      item.cantidad = item.stock;
    }
    if (item.cantidad! < 1) item.cantidad = 1;
    this.calcularTotal();
    
  }
  
  calcularCambio() {
    const total = this.total;
    let recibido = this.montoRecibido || 0;

    // Si paga en dólares, convertimos a córdobas para calcular el cambio
    if (this.monedaPago === 'USD') {
      recibido = recibido * this.tasaCambio;
    }

    this.cambio = recibido - total;
    // if (this.cambio < 0) {
    // this.cambio = 0;
    // }
  }

  //esto genera el recibo de  la factura
  generarPDF(idFactura: number) {
    const doc = new jsPDF();

    // Encabezado
    doc.setFontSize(20);
    doc.text('FACTURA DE VENTA', 105, 15, { align: 'center' });

    doc.setFontSize(10);
    doc.text(`Factura N°: ${idFactura}`, 14, 30);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 35);
    doc.text(`Cliente: ${this.cliente}`, 14, 40);

    // Tabla de productos
    const cuerpoTabla = this.carrito.map((item) => [
      item.nombre,
      item.cantidad,
      `$${item.precio}`,
      `$${(item.cantidad || 0) * item.precio}`,
    ]);
    /*
  autoTable(doc, {
    startY: 50,
    head: [['Producto', 'Cant.', 'Precio Unit.', 'Subtotal']],
    body: cuerpoTabla as any,//se puso any, apra que no diera error, por que no sabe que tipo de dato es
    theme: 'striped',
    headStyles: { fillColor: [63, 81, 181] } // El color azul de nuestro POS
  });
*/
    // Total
    const finalY = (doc as any).lastAutoTable.finalY;
    doc.setFontSize(12);
    doc.text(`TOTAL A PAGAR: $${this.total}`, 14, finalY + 10);

    // Descargar
    doc.save(`factura_${idFactura}.pdf`);
  }

  //otra manera de generar factura
  /*generarPDF(facturaId: number) { this.service.descargarPDF(facturaId).subscribe(blob => {
 const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
   a.href = url;
   a.download = `factura-${facturaId}.pdf`;
   a.click();
    window.URL.revokeObjectURL(url);
     }); }*/
  mostrarToast(toastId: string) {
    const toastEl = document.getElementById(toastId);
    if (toastEl) {
      const toast = new (window as any).bootstrap.Toast(toastEl);
      toast.show();

    }
    /*
    switch (toastId) {
    case 'productoAgotado':
      //Ejemplo con SweetAlert2 (si lo usas)
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'error',
        title: '¡Producto Agotado!',
        text: 'No hay existencias en inventario.',
        showConfirmButton: false,
        timer: 2500
      });
      break;
    case 'stockInsuficiente':
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'warning',
        title: 'Límite de Stock',
        text: 'Ya agregaste todas las unidades disponibles.',
        showConfirmButton: false,
        timer: 2500
      });
      break;
      
  }
    */
  }

  generarPDFRollpaper1(factura: any) {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, 200], // ancho 80mm típico de rollpaper
    });
    // Insertar logo desde carpeta logo
    //  const img = new Image();
    //  img.src = 'logo/logo.png'; // ruta a tu logo
    //  img.onload = () => { doc.addImage(img, 'PNG', 25, 5, 30, 20); // x, y, ancho, alto
    doc.setFontSize(12);
    doc.text('*** FACTURA ***', 5, 10);
    doc.text(`Factura #${factura.id}`, 5, 20);
    doc.text(`Cliente: ${factura.cliente}`, 5, 30);
    doc.text(`Total: ${factura.total}`, 5, 40);
    let y = 50;
    factura.detalles_factura.forEach((d: any) => {
      doc.text(`${d.producto_id} x${d.cantidad} - ${d.precio_unitario}`, 5, y);
      y += 10;
    });
    doc.text('Gracias por su compra!', 5, y + 10);
    doc.save(`factura-${factura.id}.pdf`);
  }
  generarPDFRollpaper(factura: any) {
    if (!factura) return;
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, 200], // ancho típico de rollpaper
    }); // Logo (ejemplo: texto, pero puedes usar imagen base64)
    doc.setFontSize(14);
    doc.text('🛒 Mi Tienda', 40, 10, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Factura #${factura.id}`, 5, 20);
    doc.text(`Cliente: ${factura.cliente.nombre}`, 5, 25);
    doc.text(`Fecha: ${new Date(factura.fecha).toLocaleString()}`, 5, 30);
    doc.line(5, 35, 75, 35); // línea separadora
    let y = 40;
    factura.items.forEach((d: any) => {
      doc.text(`${d.producto}`, 5, y);
      doc.text(`x${d.cantidad}`, 50, y);
      doc.text(`${d.precio_unitario}`, 65, y, { align: 'right' });
      y += 5;
    });
    doc.line(5, y, 75, y);
    y += 10;
    doc.setFontSize(12);
    doc.text(`TOTAL: ${factura.total}`, 5, y);
    y += 20;
    doc.setFontSize(10);
    doc.text('¡Gracias por su compra!', 40, y, { align: 'center' });
    // Generar QR con enlace de verificación
    // const qrData = `https://mi-tienda.com/factura/${factura.id}`;
    // const qrBase64 = await QRCode.toDataURL(qrData);
    // doc.addImage(qrBase64, 'PNG', 25, y + 10, 30, 30);
    // Dentro de tu función generarPDFRollpaper
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
    // Esto suele saltarse los bloqueadores de pop-ups
    // const link = document.createElement('a');
    // link.href = url;
    // link.target = '_blank';
    // link.click();
    //doc.save(`factura-${factura.id}.pdf`);
  }

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
  abrirModalNuevoCliente() {
  if (this.modalClientes) {
    // Le enviamos lo que el usuario escribió en el buscador
    this.modalClientes.abrirDesdeVentas(this.buscarCli);
    
    // Opcional: limpiar las sugerencias para que no estorben al fondo
    this.sugerenciasClientes = [];
  }
}
limpiarClienteSeleccionado() {
  // 1. Quitamos el objeto vinculado a la factura
  this.clienteSeleccionado = null;

  // 2. Vaciamos el texto del buscador
  this.buscarCli = '';

  // 3. Aseguramos que las sugerencias estén limpias
  this.sugerenciasClientes = [];

  //console.log("Buscador de clientes reiniciado.");
}
}
