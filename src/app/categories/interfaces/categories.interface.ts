import { IAttributesItem } from '../attributes/interfaces/attributes.interface';

export interface ICategories {
  activo: boolean;
  icono?: string;
  id: number;
  nombre: string;
  sub_categoria?: ISubCategories[];
}

export interface ISubCategories {
  related_attributes?: IAttributesItem[];
  activo: boolean;
  icono?: string;
  id: number;
  id_categoria: number;
  nombre: string;
}
