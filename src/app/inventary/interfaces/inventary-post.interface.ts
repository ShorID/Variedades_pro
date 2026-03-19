import { IInvAttrItem, IInvPack, IInvSubCategory } from './inventary.interfaces';

export interface ISaveDataInventaryCreate {
  id_marca: number;
  codigo: string;
  id_sub_categoria: number;
  costo: number;
  descripcion: string;
  stock: number;
  stock_minimo: number;
  attributes: IInvAttrItem[];
  packs: IInvPack[];
  _new_subCategoria?: IInvSubCategory
}

export type IInsertInvProduct = Pick<
  ISaveDataInventaryCreate,
  'id_marca' | 'id_sub_categoria' | 'costo' | 'codigo' | 'descripcion'
>;
export type IInsertInvStock = Pick<ISaveDataInventaryCreate, 'stock_minimo' | 'stock'>;
