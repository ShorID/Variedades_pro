import { Component, computed, effect, input, OnDestroy, OnInit, signal } from '@angular/core';
import { InventaryHttpsService } from '../../services/inventary-https.service';
import { concatMap, filter, forkJoin, from, map, Observable, switchMap, tap } from 'rxjs';
import { TextComponent } from '../../../components/Text/text.component';
import { IBrand } from '../../../categories/brands/interfaces/brand.interface';
import { BrandSelectorComponent } from '../../../categories/brands/components/brand-selector.component';
import { InputComponent } from '../../../components/Form/Input/Input.component';
import { CategoriesSelectorComponent } from '../../../categories/components/category-selector-card/category-selector-card.component';
import { SubcategorySelectorComponent } from '../../../categories/subcategories/components/subcategory-selector-card/subcategory-selector-card.component';
import { AttributesSelectorComponent } from '../../../categories/attributes/components/attributes-selector.component';
import {
  IInvAttr,
  IInvAttrItem,
  IInvCategory,
  IInventaryItem,
  IInvPack,
  IInvSubCategory,
} from '../../interfaces/inventary.interfaces';
import { InventaryPacksComponent } from '../inventary-packs/inventary-packs.component';
import { NotifyService } from '../../../services/notify.service';
import { Router } from '@angular/router';
import { IconComponent } from '../../../components/Icon/icon.component';
import { Location } from '@angular/common';

@Component({
  selector: 'page-inventary-create',
  templateUrl: './inventary-create.component.html',
  imports: [
    TextComponent,
    BrandSelectorComponent,
    InputComponent,
    CategoriesSelectorComponent,
    SubcategorySelectorComponent,
    AttributesSelectorComponent,
    InventaryPacksComponent,
    IconComponent,
  ],
})
export class InventaryCreateComponent implements OnInit, OnDestroy {
  title = input<string>('Creando nuevo producto');
  defaultData = input<IInventaryItem>();

  defaultDataEffect = effect(() => {
    const defaultData = this.defaultData();
    if (defaultData) {
      this.formData['codigo'] = defaultData.codigo || '';
      this.formData['costo'] = defaultData.costo || '';
      this.formData['descripcion'] = defaultData.descripcion;
      if (defaultData.inventary?.length) {
        this.formData['stock'] = defaultData.inventary[0].stock + '';
        this.formData['stock_minimo'] = defaultData.inventary[0].stock_minimo + '';
      }
      queueMicrotask(() => {
        this.selectedCategory.set(defaultData.categoria);
        this.selectedSubCategory.set(defaultData.sub_categoria);
        this.selectedPacks.set(defaultData.packs);
        this.selectedAttribute.set(defaultData.attributes);
        this.selectedBrand.set(defaultData.marca);
      });
    }
  });

  brands = signal<IBrand[]>([]);
  categories = signal<IInvCategory[]>([]);
  selectedBrand = signal<IBrand | undefined>(undefined);
  subcategories = signal<IInvSubCategory[]>([]);
  attributes = signal<IInvAttr[]>([]);
  showValidations = signal<boolean>(false);
  formData: Record<string, string> = {};

  selectedSubCategory = signal<IInvSubCategory | undefined>(undefined);
  selectedCategory = signal<IInvCategory | undefined>(undefined);
  selectedAttribute = signal<IInvAttrItem[]>([]);
  selectedAttr = computed(() => {
    return this.selectedAttribute().map((i) => i.id + '');
  });
  selectedPacks = signal<IInvPack[]>([
    {
      abreviatura: 'UND',
      nombre: 'Unidad',
      codigo: '',
      precio_venta: 0,
      unidades_empaques: 0,
      default: true,
      required: true,
    },
    {
      abreviatura: 'CJ',
      nombre: 'Caja',
      codigo: '',
      precio_venta: 0,
      unidades_empaques: 0,
      default: true,
    },
  ]);

  constructor(
    private invHttpService: InventaryHttpsService,
    private notify: NotifyService,
    private router: Router,
    private location: Location,
  ) {}

  ngOnInit() {
    this.invHttpService
      .getInvClasification()
      .pipe(
        tap(({ attributes, categories, subCategories }) => {
          this.categories.set(categories);
          this.subcategories.set(subCategories);
          this.attributes.set(attributes);
        }),
      )
      .subscribe();
    this.invHttpService
      .getBrands()
      .pipe(tap(({ data }) => data && this.brands.set(data)))
      .subscribe();
  }

  ngOnDestroy(): void {
    this.defaultDataEffect.destroy();
  }

  selectCategory(item: IInvCategory | undefined) {
    this.selectedCategory.update(() => item);
    this.selectedAttribute.update(() => []);
  }
  selectSubcategory(item: IInvSubCategory | undefined) {
    this.selectedSubCategory.update(() => item);
  }
  selectBrand(item: IBrand | undefined) {
    this.selectedBrand.update(() => item);
  }
  selectAttr(items: IInvAttrItem[]) {
    this.selectedAttribute.update(() => items);
  }
  selectPacks(items: IInvPack[]) {
    this.selectedPacks.update(() => items);
  }
  onChangeInput(e: Event) {
    const { value, name } = e.target as HTMLInputElement;
    this.formData[name] = value;
  }
  saveData() {
    this.showValidations.update(() => true);
    const brand = this.selectedBrand()?.id;
    const cty = this.selectedCategory()?.id;
    const sCty = this.selectedSubCategory()?.id;
    if (brand && cty && sCty)
      this.invHttpService
        .insertProduct({
          id_marca: brand,
          codigo: this.formData['codigo'],
          id_sub_categoria: sCty,
          costo: this.formData['costo'],
          descripcion: this.formData['descripcion'],
        })
        .pipe(
          map(({ data }) => {
            if (data?.length) return data[0].id;
            return null;
          }),
          filter((res) => !!res),
          switchMap((id) => {
            let inserts: Observable<any>[] = [
              this.invHttpService.insertProductInv(id, {
                stock: +this.formData['stock'],
                stock_minimo: +this.formData['stock_minimo'],
              }),
              this.invHttpService.insertProductAttr(id, this.selectedAttribute()),
              this.invHttpService.insertProductPack(id, this.selectedPacks()),
            ];

            return forkJoin(inserts);
          }),
        )
        .subscribe({
          next: () => {
            this.notify.success('Articulo Creado correctamente!');
            this.router.navigateByUrl('inventary');
          },
          error: (err) => {
            this.notify.error('Ocurrio un error al crear el producto');
          },
        });
  }

  goBack() {
    this.location.back();
  }
}
