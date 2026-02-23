import { ICategories, ISubCategories } from './categories.interface';
import { IBrand } from './brand.interface'
import { IAttrValue } from './attributes.interface';

export interface IModal {
    isOpen: boolean, 
    type: string,
    textQuestion: string,
    textAdditional: string,
    textbold: string,
    item?: ICategories | ISubCategories | IBrand | IAttrValue
}