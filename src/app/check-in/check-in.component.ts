import { Component, OnInit, ElementRef, ViewChild,ChangeDetectorRef, AfterContentChecked,ChangeDetectionStrategy,HostListener } from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  //este es para que del cliente salte al producto
  @ViewChild('txtBuscarProducto') txtBuscarProducto!: ElementRef<HTMLInputElement>;
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
  //estas variables para la nueva version de productos que se filtran
  public productosFiltradosList: any[] = [];
  public productosPaginadosList: any[] = [];
  // 1. Define las variables como números normales
  public totalPaginas: number = 1;
  public totalItemsFiltrados: number = 0;
  //esta es para los filtros de categorias
  productosFiltrados: any[] = []; // Esta es la que usaremos en el @for de la vista

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
      //setTimeout(() => {
      this.listaAtributos = attr;
      this.cdr.markForCheck(); // <--- Notifica el cambio de forma segura
      //});
    });
    
    
    
    this.service.getProductos().subscribe((res) => {
      this.productos = res;
      const cats = [...new Set(res.map((p) => p.categoria))]; // Extrae nombres únicos
      this.categorias = ['Todas', ...cats];

      // Al cargar por primera vez, mostramos todos
     //this.filtrarPorCategoria('Todas'); 
     //this.cdr.markForCheck();

      // ¡Llamamos a la actualización manual!
      this.actualizarListaVisible();
      this.cdr.markForCheck(); // <--- Notifica el cambio de forma segura
    });
  }
/*
  // FUNCIÓN CLAVE: La que hace que los botones funcionen
  filtrarPorCategoria(cat: string) {
    this.categoriaSeleccionada = cat;

    if (cat === 'Todas') {
        this.productosFiltrados = [...this.productos];
    } else {
        this.productosFiltrados = this.productos.filter(p => p.categoria === cat);
    }

    // Si tienes paginación, recuerda resetearla a la página 1 aquí
    this.paginaActual = 1; 
    this.actualizarListaVisible(); // Tu función que corta el array para la vista
    this.cdr.detectChanges(); // Fuerza a Tabler a repintar los botones
}
  ngAfterContentChecked(): void {
  this.cdr.detectChanges(); // Esto resuelve el error "ExpressionChanged" de forma global
  }
  */
  /*
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
  */

  actualizarListaVisible(textoForzado?: string) { //entre parentesis (textoForzado?: string)
    //const termino = this.buscarpro?.toLowerCase().trim() || '';
    const termino = (textoForzado !== undefined ? textoForzado : this.buscarpro).toLowerCase().trim();
    //const termino = (textoForzado !== undefined ? textoForzado : this.buscarpro).toLowerCase().trim();
    //const categoria = catForzada !== undefined ? catForzada : this.categoriaSeleccionada;
    // Si limpiamos la búsqueda, regresamos a la página 1 siempre
   if (textoForzado !== undefined) {
    this.paginaActual = 1;
  }
  // 1. FILTRADO INTELIGENTE (Con excepción para Escáner)
  const filtrados = this.productos.filter((p) => {
    const nombreLower = p.nombre.toLowerCase();
    const codigoLower = p.codigo?.toString().toLowerCase() || '';

    // REGLA DE ORO: Si el escáner manda el código exacto, PASA SIEMPRE
    const esEscaneoDirecto = termino !== '' && (codigoLower === termino || nombreLower === termino);
    if (esEscaneoDirecto) return true;

    // FILTRADO NORMAL: Por texto y por categoría
    const coincideTexto = nombreLower.includes(termino) || codigoLower.includes(termino);
    const coincideCat = this.categoriaSeleccionada === 'Todas' || p.categoria === this.categoriaSeleccionada;

    return coincideTexto && coincideCat;
  });

  // Guardamos la lista filtrada completa para cálculos
  //this.productosFiltrados = filtrados;

  // 2. CÁLCULOS DE PAGINACIÓN
  this.totalItemsFiltrados = filtrados.length;
  this.totalPaginas = Math.ceil(this.totalItemsFiltrados / this.itemsPorPagina);
  
  // Evitar que la página quede "huérfana"
  //if (this.paginaActual > this.totalPaginas && this.totalPaginas > 0) {
   // this.paginaActual = 1;
  //}
  // VALIDAR PÁGINA ACTUAL (Si el filtro reduce los items, volvemos a la 1)
  // 4. LÓGICA DE REINICIO DE PÁGINA (CORREGIDA)
  // Solo volvemos a la página 1 si el total de páginas actual es menor a donde estamos parado
  if (this.paginaActual > this.totalPaginas && this.totalPaginas > 0) {
    this.paginaActual = 1;
  }

  // Si acabamos de escribir algo nuevo (textoForzado), ahí sí reseteamos a la 1
  // if (textoForzado !== undefined) {
  //   this.paginaActual = 1;
  // }
  // 3. PAGINACIÓN Y ASIGNACIÓN (Evitando NG0100)
  const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
  const fin = inicio + this.itemsPorPagina;

  
  
  setTimeout(() => {
    // IMPORTANTE: Paginar sobre 'filtrados' que acabamos de generar
    this.productosPaginadosList = filtrados.slice(inicio, fin);
    this.cdr.markForCheck();
  });
  
}
 /*
  actualizarListaVisible() {
  // 1. Filtrar
  const termino = this.buscarpro.toLowerCase();
  const filtrados = this.productos.filter((p) => {
    const coincideNombre = p.nombre.toLowerCase().includes(termino);
    const coincideCodigo = p.codigo?.toString().includes(termino);
    const coincideCat = this.categoriaSeleccionada === 'Todas' || p.categoria === this.categoriaSeleccionada;
    return (coincideNombre || coincideCodigo) && coincideCat;
  });

  // 2. Calcular Paginación basándonos en los resultados FILTRADOS
  this.totalItemsFiltrados = filtrados.length;
  this.totalPaginas = Math.ceil(this.totalItemsFiltrados / this.itemsPorPagina);
  
  // 3. Validar que la página actual no se quede "huérfana"
  if (this.paginaActual > this.totalPaginas && this.totalPaginas > 0) {
    this.paginaActual = 1;
  }

  // 2. Paginar
  const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
  const fin = inicio + this.itemsPorPagina;

  // 3. Asignar con un pequeño delay para evitar el error NG0100
  setTimeout(() => {
    //this.productosFiltradosList = filtrados;
    //this.productosPaginadosList = filtrados.slice(inicio, fin);
    // Usamos la lista filtrada para la paginación de la cuadrícula
    this.productosPaginadosList = this.productosFiltrados.slice(inicio, fin);
    this.cdr.markForCheck();
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
  
  cambiarPagina(nueva: number) {
    if (nueva >= 1 && nueva <= this.totalPaginas) {
    this.paginaActual = nueva;
    this.actualizarListaVisible(); // <--- IMPORTANTE: Refresca la vista
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
   this.paginaActual = 1;

  // 1. FILTRADO: Creamos la lista que se va a mostrar
  if (cat === 'Todas') {
    // Si elige 'Todas', usamos el array original completo
    this.productosFiltrados = [...this.productos];
  } else {
    // Si elige una categoría, filtramos el array original
    this.productosFiltrados = this.productos.filter(p => p.categoria === cat);
  }
  // 2. REFRESCAR: Ahora la paginación trabajará sobre 'productosFiltrados'
  this.actualizarListaVisible(); 
  
  // 3. UI: Para que los botones cambien de color (active/outline)
  this.cdr.detectChanges();
  }
  

  limpiarFiltros() {
  this.buscarpro = '';
  this.atributoFiltro = '';
  this.valorAtributo = '';
  this.categoriaSeleccionada = 'Todos';
  this.onBuscarChange();
  }

  async onBuscarChange() {
    //const texto = this.buscarpro.trim();
    //this.actualizarListaVisible(texto);
    // 1. Limpiamos el timer anterior
  if (this.debounceTimer) clearTimeout(this.debounceTimer);
    const textoBusqueda = this.buscarpro.trim();
  // Si acabamos de limpiar el buscador (por el Enter), no busques nada
  if (!textoBusqueda && !this.valorAtributo.trim()) {
    this.actualizarListaVisible(this.buscarpro); // Muestra todo lo de la categoría actual
    this.sugerencias = [];
    
    return;
  }
    this.actualizarListaVisible(this.buscarpro);

   if (textoBusqueda.length > 1 || this.valorAtributo.length > 1) {
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
      
      const parametros = {
      texto: this.buscarpro,
      atributo: this.atributoFiltro,
      valorAtributo: this.valorAtributo,
      categoria: this.categoriaSeleccionada,
    };
    
    // Llamamos al servicio
    const resultados = await this.service.buscarProductosFiltrados(parametros);

    // Asignamos los datos y reseteamos paginación
    if (resultados && resultados.length > 0) {
        this.productos = resultados;
        this.paginaActual = 1;
        this.actualizarPaginacion(); // Refrescamos la vista con los datos del servidor
      }
        this.cdr.detectChanges();
    },150 );
    } else {
    this.sugerencias = [];
    this.actualizarListaVisible(); // Mantenemos el filtro local activo
    }
   
  }

   //esto es agregar carrito actual, es seleccionando el producto
   seleccionarProducto(prod: Producto) {
    // 1. Limpiamos buscador y sugerencias inmediatamente
    this.buscarpro = '';
    this.sugerencias = [];
    //this.productosPaginadosList = []; // O la lista que uses para el @for
    //esto apra validar que este en cero
      const stockDisponible = prod.stock || 0;
    if (stockDisponible <= 0) {
    this.mostrarToast('Agotado'); // O un alert: "Producto agotado"
    console.warn(`Intento de agregar ${prod.nombre} sin stock.`);
    return; // Detenemos la función aquí
    }
    // 2. (Opcional) Validar si ya está en el carrito y si excederá el stock
    const itemEnCarrito = this.carrito.find(item => item.id === prod.id);
    //if (itemEnCarrito && (itemEnCarrito.cantidad ?? 0 + 1) > stockDisponible) { //asi estaba antes y funcionaba, segun esto lo hace mejor
    const cantidadActual = itemEnCarrito ? (itemEnCarrito.cantidad ?? 0) : 0;

  if (cantidadActual + 1 > stockDisponible) {
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
    
    this.actualizarListaVisible('');//esta se puso con el cambio de el filtro, si afecta se quita
    //esto es de prueba para despues de agregar pone elcursor en producto
    setTimeout(() => {
    // 3. Regresamos el cursor al buscador de productos
    this.enfocarBuscadorProductos();
    
    // 4. Notificamos el cambio para que las listas desaparezcan visualmente
    this.cdr.markForCheck();
   }, 150);
  }

  
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

    
  }
  
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

  
  seleccionarCliente(cli: Cliente) {
    setTimeout(() => {
    this.clienteSeleccionado = cli;
    this.buscarCli = cli.nombre;     // Se llena el input
    this.sugerenciasClientes = [];    // Se limpia la lista de búsqueda

    // Después de seleccionar al cliente, el cursor se va directo a los productos
    this.txtBuscarProducto.nativeElement.focus();
    // ¡IMPORTANTE! Si usas OnPush, necesitas esta línea:
    this.cdr.markForCheck(); 
    
    // Si NO usas OnPush pero el error persiste, usa:
    // this.cdr.detectChanges();
    
    //console.log("Cliente seleccionado con éxito:", cli.nombre);
  }, 0);
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
          setTimeout(() => {
          // 1. Asignamos la referencia
        this.clienteSeleccionado = predeterminado; 
        this.buscarCli = predeterminado.nombre;
        this.sugerenciasClientes = [];
        // 2. Ejecutamos tu función de selección para llenar variables
        //this.seleccionarCliente(predeterminado);

        // 3. Forzamos a Angular a detectar que el valor cambió
        this.cdr.detectChanges();
        }, 0);
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
    
    // Total
    const finalY = (doc as any).lastAutoTable.finalY;
    doc.setFontSize(12);
    doc.text(`TOTAL A PAGAR: $${this.total}`, 14, finalY + 10);

    // Descargar
    doc.save(`factura_${idFactura}.pdf`);
  }

  
  mostrarToast(toastId: string) {
    const toastEl = document.getElementById(toastId);
    if (toastEl) {
      const toast = new (window as any).bootstrap.Toast(toastEl);
      toast.show();

    }
   
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
    doc.text('COMERCIAL JAZMIN', 40, 10, { align: 'center' });
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
  abrirModalNuevoCliente() {
  if (this.modalClientes) {
    // Le enviamos lo que el usuario escribió en el buscador
    setTimeout(() => {
      this.modalClientes.abrirDesdeVentas(this.buscarCli);
      this.sugerenciasClientes = [];
      this.cdr.markForCheck();
    }, 10);
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
@HostListener('window:keydown', ['$event'])
handleKeyboardEvent(event: KeyboardEvent) {
  // Verificamos si la tecla presionada es F2
  if (event.key === 'F2') {
    // Evitamos que el navegador haga su función por defecto
    event.preventDefault();
    
    // Mandamos el cursor al buscador de productos
    this.enfocarBuscadorProductos();
  }

  // Atajo para nuevo cliente (F4)
  if (event.key === 'F4') {
    event.preventDefault();
    if (this.modalClientes) {
      this.abrirModalNuevoCliente();
      
      // Forzamos la detección de cambios para que el modal aparezca de inmediato
      this.cdr.markForCheck(); 
      // O si prefieres ser más agresivo con los cambios:
      // this.cdr.detectChanges();
    }
  }
  // Esc: Limpiar y Regresar
  if (event.key === 'Escape') {
    // 1. Limpiamos sugerencias de clientes y productos que estén abiertas
    this.sugerenciasClientes = [];
    this.productosFiltradosList = []; // Opcional: si quieres limpiar la vista previa
    
    // 2. Si tienes una variable para cerrar el modal manualmente:
    if (this.modalClientes) {
    this.modalClientes.cerrarModal(); 
    }

    // 3. Regresamos el cursor al buscador de productos
    setTimeout(() => {
    // 3. Regresamos el cursor al buscador de productos
    this.enfocarBuscadorProductos();
    // 4. Notificamos el cambio para que las listas desaparezcan visualmente
    this.cdr.markForCheck();
   }, 150);

    
    //this.cdr.markForCheck();
  }
  if (event.key === 'Enter') {
    // Solo actuamos si el usuario está en el buscador de productos
    const estaEnBuscador = document.activeElement === this.txtBuscarProducto.nativeElement;
    
    if (estaEnBuscador) {
      this.agregarProductoAutomatico();
      // Evitamos que el Enter haga un "submit" del formulario si existe
      event.preventDefault();
    }
  }
  }
// Creamos una pequeña función reutilizable
 enfocarBuscadorProductos() {
  if (this.txtBuscarProducto) {
    setTimeout(() => {
    this.txtBuscarProducto.nativeElement.focus();
    this.cdr.markForCheck();
      }, 10);
    // Opcional: Selecciona el texto existente para sobrescribir rápido
    this.txtBuscarProducto.nativeElement.select(); 
    
    this.cdr.markForCheck();
  }
 }
  agregarProductoAutomatico() {
  // Si solo hay un producto visible después del filtro
   if (this.productosPaginadosList.length === 1) {
    const productoUnico = this.productosPaginadosList[0];
    
    // Llamamos a tu función existente de agregar al carrito
    this.seleccionarProducto(productoUnico);

    // Limpiamos el buscador para la siguiente venta
    this.buscarpro = '';
    this.actualizarListaVisible(); // Para que la lista se limpie/refresque
    
    console.log("Producto agregado automáticamente:", productoUnico.nombre);
    
    this.cdr.markForCheck();
   } else if (this.productosPaginadosList.length > 1) {
    // Opcional: Si hay varios, podrías agregar el primero de la lista
    // o simplemente no hacer nada para que el usuario elija.
    console.warn("Hay más de un resultado, por favor sea más específico.");
   }
  }

  async ejecutarEnterProducto(textoBusqueda: string) {
  const termino = textoBusqueda?.trim();
  if (!termino) return;

  // 1. PRIORIDAD ESCÁNER: Si el texto parece un código o el debounce no ha terminado
  // Hacemos la búsqueda directa a la base de datos sin esperar a las sugerencias.
  const parametros = {
    texto: termino,
    atributo: '', // Buscamos global para no fallar por filtros
    valorAtributo: '',
    categoria: this.categoriaSeleccionada,
  };

  try {
    const resultados = await this.service.buscarProductosFiltrados(parametros);

    if (resultados && resultados.length > 0) {
      // Si el código es exacto o hay coincidencias, agarramos el primero
      this.seleccionarProducto(resultados[0]);
      this.finalizarCaptura(); // Limpia todo y da el Beep
    } 
    // 2. SEGUNDA OPCIÓN: Si la búsqueda directa falló (raro), intentamos con lo que haya en sugerencias
    else if (this.sugerencias.length > 0) {
      this.seleccionarProducto(this.sugerencias[0]);
      this.finalizarCaptura();
    } 
    else {
      console.warn("No se encontró el producto:", termino);
      this.reproducirErrorBeep(); 
    }
  } catch (error) {
    console.error("Error en Enter:", error);
  }
 }//find e enter

  finalizarCaptura() {
  this.reproducirBeep();
  this.buscarpro = '';
  this.sugerencias = [];
  if (this.debounceTimer) clearTimeout(this.debounceTimer);
  
  // Limpieza física del input para asegurar que quede vacío para el siguiente escaneo
  if (this.txtBuscarProducto) {
    this.txtBuscarProducto.nativeElement.value = '';
    this.txtBuscarProducto.nativeElement.focus();
  }
  this.cdr.markForCheck();
 }

  reproducirBeep() {
  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.type = 'sine'; // Tono suave
  oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // Nota La (A5)
  gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); // Volumen bajo

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.1); // Duración de 100ms
 }

  reproducirErrorBeep() {
  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.type = 'square'; // Sonido más tosco
  oscillator.frequency.setValueAtTime(150, audioCtx.currentTime); // Frecuencia baja
  gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.3); // Más largo
}

}
