import { ICategories, ISubCategories } from './categories.interface'

export interface IModal {
    isOpen: boolean, 
    type: string,
    textQuestion: string,
    textAdditional: string,
    item?: ICategories | ISubCategories
}