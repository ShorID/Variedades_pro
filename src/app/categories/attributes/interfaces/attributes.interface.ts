export interface IAttributes {
  active: boolean;
  create_at: string;
  id: number;
  items?: IAttributesItem[];
  name: string;
}

export interface IAttributesItem {
  active: boolean;
  create_at: string;
  name: string;
  id: number;
  id_attribute: number;
}
