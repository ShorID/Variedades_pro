export interface IRawInventaryItem {
  id: any;
  nombre: any;
  modelo: any;
  codigo: any;
  activo: any;
  articulo_variante: {
    costo: any;
    codigo: any;
    activo: any;
    inventario: any[];
    articulo_variante_atr_val: {
      atr_val: any[];
    }[];
    articulo_empaque: any[];
  }[];
  sub_categoria: any[];
  marca: any[];
}

export interface IInventaryItemDetail {
  id: number;
  costo?: number;
  activo: boolean;
  codigo?: string;
  id_inventario: number;
  stock: number;
  id_sucursal: number;
  stock_minimo: number;
  packs: {
    id: number;
    activo: boolean;
    codigo?: string;
    nombre: string;
    abreviatura: string;
    precio_venta: number;
    unidades_empaque: number;
  }[];
  attributes: {
    id: number;
    valor: string;
    activo: boolean;
    id_atributo: number;
  }[];
}

export interface IInventaryItem {
  id: number;
  nombre: string;
  modelo?: string;
  codigo?: string;
  activo: boolean;
  categoria: {
    id: number;
    icono?: string;
    activo: boolean;
    nombre: string;
  };
  sub_categoria: {
    id: number;
    icono?: string;
    activo: boolean;
    nombre: string;
    id_categoria: number;
  };
  marca: {
    id: number;
    icono?: string;
    activo: boolean;
    nombre: string;
  };
  details: IInventaryItemDetail[];
  forSearch: string;
}

