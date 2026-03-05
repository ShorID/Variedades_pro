export interface IpaginationAttr{
  attributes: IAttribute[],
  totalRecords: number
  totalPages: number
}

export interface IAttribute {
  id: number,
  attribute: string,
  value: string,
  active: boolean,
  active_atr: boolean,
  p_record: number
}