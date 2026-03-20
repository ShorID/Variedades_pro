export interface IpaginationAttr{
  attributes: IAttribute[],
  totalRecords: number
  totalPages: number
}

export interface IAttribute {
  id: number,
  id_attribute:number,
  attribute: string,
  value: string,
  active: boolean,
  active_atr: boolean,
  p_record: number
}

export interface IinsertUpdateAttr {
  id?: number,
  id_atributo?: number,
  valor: string,
  activo: boolean
}

export interface IAttrVal {
  id_attribute: number,
  id_sub_categoria: number,
  attribute: string,
  attributes: {id_value: number, value: string, state: string}[]
}

export interface ISearchAvailableAtr{
    id_attribute:number,
    name: string,
    id_value: number,
    value: string
}

export interface ISubCatAtrVal{
  id_sub_categoria: number,
  id_atr_val: number,
  activo: boolean
}