import { ICategories, ISubCategories } from './categories.interface';
import { IBrand } from './brand.interface'
import { IAttribute } from './attributes.interface';
import { IAttrVal } from './attributes.interface';

export interface IdisableModal {
    isOpen: boolean, 
    entity: string,
    textQuestion: string,
    textAdditional: string,
    textbold: string,
    item?: ICategories | ISubCategories | IBrand | IAttribute
}

export interface IaddEditModal {
    isOpen: boolean,
    entity: string,
    title: string,
    placeholder: string,
    action: string,
    errorMsg:string,
    value: string,
    itemId: number
}

export interface IaddEditAttrModal {
    isOpen: boolean,
    entity: string,
    title: string,
    placeholder: string,
    action: string,
    errorMsg:string,
    options: { id: number, nombre: string }[],
    value: string,
    itemId: number
}

export interface ImanageAttrModal {
    isOpen: boolean,
    title: string,
    options: IAttrVal[],
}