export interface IInventaryItem {
  id: number;
  nombre_variante: string; // En el esquema es 'descripcion' en articulo_variante
  codigo: string;
  activo: boolean;
  marca: any;
  sub_categoria: any;
  categoria: any;
  details: IInventaryItemDetail[];
  forSearch: string;
}

export interface IInventaryItemDetail {
  id: number;
  id_inventario: number;
  id_sucursal: number;
  stock: number;
  stock_minimo: number;
  codigo: string;
  costo: number;
  activo: boolean;
  attributes: any[];
  packs: any[];
}

export interface IRawInventaryItem {
  // Ajustado al esquema: articulo_variante es la base
  id: number;
  descripcion: string;
  codigo: string;
  activo: boolean;
  costo: number;
  id_marca: number;
  id_sub_categoria: number;
  marca: any;
  sub_categoria: any;
  inventario: any[];
  articulo_variante_atr_val: any[];
  articulo_empaque: any[];
}