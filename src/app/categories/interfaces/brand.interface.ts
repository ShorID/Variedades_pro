export interface IpaginationBrand {
  brands: IBrand[],
  totalRecords: number
  totalPages: number
}

export interface IBrand{
  id: number,
  name: string,
  active: boolean,
  icon: string
  p_records:number
}

export interface IinsertUpdateBrand {
  id?: number
  nombre: string,
  activo: boolean
}