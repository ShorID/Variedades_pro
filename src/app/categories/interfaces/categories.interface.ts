export interface IpaginationCat {
  categories: ICategories[],
  totalRecords: number
  totalPages: number
}

export interface ICategories {
  id: number,
  name: string,
  active: boolean,
  icon: string
  subcategories: ISubCategories[],
  p_record: number
}

export interface ISubCategories {
  id: number,
  name : string,
  icon: string,
  active: boolean
  p_record: number
}