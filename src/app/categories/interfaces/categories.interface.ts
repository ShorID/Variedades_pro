export interface IpaginationCat {
  categories: ICategories[],
  totalRecords: number
  totalPages: number
}

export interface IpaginationSubCat {
  Subcategories: ISubCategories[],
  totalRecords: number
  totalPages: number
}

export interface ICategories {
  id: number,
  name: string,
  active: boolean,
  icon: string
  sc_record: number,
  p_record: number
}

export interface ISubCategories {
  id: number,
  name : string,
  icon: string,
  active: boolean
  p_record: number
}
