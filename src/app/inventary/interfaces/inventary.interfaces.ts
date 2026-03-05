export interface IRawInventaryItem {
  id: any;
  costo: any;
  codigo: any;
  activo: any;
  descripcion: any;
  inventario: any[];
  articulo_variante_atr_val: {
    atr_val: any[];
  }[];
  articulo_empaque: any[];
  sub_categoria: any[];
  marca: any[];
}

export interface IRawInvCategories {
  id: any;
  nombre: any;
  icono: any;
  activo: any;
  sub_categoria: {
    id: any;
    id_categoria: any;
    activo: any;
    nombre: any;
    icono: any;
  }[];
}

export interface IRawInvAttr {
  id: any;
  nombre: any;
  activo: any;
  atr_val: {
    id: any;
    id_atributo: any;
    valor: any;
    activo: any;
    sub_categoria_atr_val: {
      id_sub_categoria: any
    }[]
  }[];
}

export interface IRawInventaryCateogry {
  id: any;
  nombre: any;
  icono: any;
  activo: any;
  sub_categoria: {
    id: any;
    id_categoria: any;
    activo: any;
    nombre: any;
    icono: any;
    sub_categoria_atr_val: {
      id: any;
      id_sub_categoria: any;
      id_atr_val: any;
      activo: any;
      atr_val: {
        id: any;
        id_atributo: any;
        valor: any;
        activo: any;
        atributo: {
          id: any;
          nombre: any;
          activo: any;
        };
      }[];
    }[];
  }[];
}

export interface IInventary {
  id: number;
  id_sucursal: number;
  stock: number;
  stock_minimo: number;
}

export interface IInvCategory {
  id: number;
  icono?: string;
  activo: boolean;
  nombre: string;
  subCategories?: IInvSubCategory[];
  qty?: number
}

export interface IInvSubCategory {
  id: number;
  icono?: string;
  activo: boolean;
  nombre: string;
  id_categoria: number;
  attributes?: IInvAttr[];
}

export interface IInvBrand {
  id: number;
  icono?: string;
  activo: boolean;
  nombre: string;
}
export interface IInvPack {
  id?: number;
  activo?: boolean;
  codigo?: string;
  nombre: string;
  abreviatura: string;
  precio_venta: number;
  unidades_empaques: number;
  default?: boolean;
  required?: boolean;
}

export interface IInvAttr {
  id: number;
  nombre: string;
  activo: boolean;
  items: IInvAttrItem[];
}

export interface IInvAttrItem {
  id: number;
  valor: string;
  activo: boolean;
  id_atributo: number;
  relatedSubCategories?: number[]
}

export interface IInventaryItem {
  id: number;
  codigo?: string;
  activo: boolean;
  categoria: IInvCategory;
  sub_categoria: IInvSubCategory;
  marca: IInvBrand;
  packs: IInvPack[];
  attributes: IInvAttrItem[];
  inventary: IInventary[];
  descripcion: string;
  forSearch: string;
  costo?: string
}

export interface IInvBrand {
  id: number;
  nombre: string;
  activo: boolean;
  icono?: string;
  isNew?: boolean;
  qty?: number;
}