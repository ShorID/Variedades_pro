export interface Empaque {
  id: number;
  nombre_empaque: string;
  precio: number;
  unidades_empaque: number;
}

export interface Producto {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  cantidad?: number; // Para el carrito
  categoria: string; //para las categorias
  codigo: number; //esto es para el codigo de barras
  mensajeStock?: string; // <-- nueva propiedad opcional
  empaques: Empaque[]; // Lista de empaques del producto
  empaqueSeleccionado?: Empaque; // Para guardar la elección actual
  //subtotal?: number;//esto es para el subtotal a poner y es opcional
  descuentoPorLinea: number;
}

