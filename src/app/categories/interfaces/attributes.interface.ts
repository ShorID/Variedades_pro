export interface IpaginationAttr{
  attributes: IAttribute[],
  totalRecords: number
  totalPages: number
}

export interface IAttribute {
  id: number,
  name: string,
  active: boolean,
  values: IAttrValue[]
}

export interface IAttrValue{
  id:number,
  value: string,
  active: boolean,
  p_record: number
}