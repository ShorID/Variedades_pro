import { IAttributesItem } from '../attributes/interfaces/attributes.interface';

export interface ICategories {
  active: boolean;
  create_at: string;
  id: number;
  name: string;
  subcategories?: ISubCategories[];
}

export interface ISubCategories {
  active: boolean;
  related_attributes?: IAttributesItem[];
  create_at: string;
  id: number;
  id_category: number;
  name: string;
}
