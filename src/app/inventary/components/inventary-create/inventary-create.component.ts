import {
  Component,
  computed,
  effect,
  input,
  OnDestroy,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { InventaryHttpsService } from '../../services/inventary-https.service';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  filter,
  forkJoin,
  map,
  Observable,
  of,
  Subscription,
  switchMap,
  tap,
} from 'rxjs';
import { TextComponent } from '../../../components/Text/text.component';
import { BrandSelectorComponent } from '../../../categories/brands/components/brand-selector.component';
import { InputComponent } from '../../../components/Form/Input/Input.component';
import { SubcategorySelectorComponent } from '../../../categories/subcategories/components/subcategory-selector-card/subcategory-selector-card.component';
import { AttributesSelectorComponent } from '../../../categories/attributes/components/attributes-selector.component';
import {
  IInvAttr,
  IInvAttrItem,
  IInvCategory,
  IInventaryItem,
  IInvPack,
  IInvSubCategory,
  IInvBrand,
} from '../../interfaces/inventary.interfaces';
import { InventaryPacksComponent } from '../inventary-packs/inventary-packs.component';
import { NotifyService } from '../../../services/notify.service';
import { ActivatedRoute, Router } from '@angular/router';
import { IconComponent } from '../../../components/Icon/icon.component';
import { Location } from '@angular/common';
import { ISaveDataInventaryCreate } from '../../interfaces/inventary-post.interface';

@Component({
  selector: 'page-inventary-create',
  templateUrl: './inventary-create.component.html',
  imports: [
    TextComponent,
    BrandSelectorComponent,
    InputComponent,
    SubcategorySelectorComponent,
    AttributesSelectorComponent,
    InventaryPacksComponent,
    IconComponent,
  ],
})
export class InventaryCreateComponent implements OnInit, OnDestroy {
  title = input<string>('Creando nuevo producto');
  defaultData = input<IInventaryItem>();
  redirectToInvAfterSave = input<boolean>(true);

  rewriteSave = input<boolean>(false);
  onSave = output<ISaveDataInventaryCreate>();

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
        this.selectedAttributes.set(defaultData.attributes);
        this.selectedBrand.set(defaultData.marca);
      });
    }
  });

  brands = signal<IInvBrand[]>([]);
  categories = signal<IInvCategory[]>([]);
  categoriesEffect = effect(() => {
    if (this.categories().length && !this.selectedCategory())
      queueMicrotask(() => this.selectedCategory.set(this.categories()[0]));
  });
  selectedBrand = signal<IInvBrand | undefined>(undefined);
  subcategories = signal<IInvSubCategory[]>([]);
  attributes = signal<IInvAttr[]>([]);
  showValidations = signal<boolean>(false);
  formData: Record<string, string> = {};

  selectedSubCategory = signal<IInvSubCategory | undefined>(undefined);
  selectedCategory = signal<IInvCategory | undefined>(undefined);
  selectedAttributes = signal<IInvAttrItem[]>([]);
  selectedAttr = computed(() => {
    return this.selectedAttributes().map((i) => i.id + '');
  });
  selectedAttrNames = computed(() => {
    return this.selectedAttributes()
      .map((i) => i.valor + '')
      .join(', ');
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

  loading = signal<{ brand: boolean; categories: boolean }>({ brand: true, categories: true });
  refreshSubject = new BehaviorSubject<'brand' | 'categories' | 'all'>('all');
  suscription: Subscription[] = [];

  constructor(
    private invHttpService: InventaryHttpsService,
    private notify: NotifyService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
  ) {}

  ngOnInit() {
    this.suscription.push(
      this.refreshSubject
        .asObservable()
        .pipe(
          switchMap((toRefresh) => {
            const req: Observable<unknown>[] = [];
            if (toRefresh === 'all' || toRefresh === 'brand') {
              this.loading.update((prev) => ({ ...prev, brand: true }));
              req.push(
                this.invHttpService.getBrands().pipe(
                  tap(({ data }) => {
                    if (data) {
                      this.brands.set(data);
                    }
                    this.loading.update((prev) => ({ ...prev, brand: false }));
                  }),
                  catchError(() => {
                    this.loading.update((prev) => ({ ...prev, brand: false }));
                    return of(null);
                  }),
                ),
              );
            }
            if (toRefresh === 'all' || toRefresh === 'categories') {
              this.loading.update((prev) => ({ ...prev, categories: true }));
              req.push(
                this.invHttpService.getInvClasification().pipe(
                  tap(({ attributes, categories, subCategories }) => {
                    this.loading.update((prev) => ({ ...prev, categories: false }));
                    this.categories.set(categories);
                    this.subcategories.set(subCategories);
                    this.attributes.set(attributes);
                  }),
                  catchError(() => {
                    this.loading.update((prev) => ({ ...prev, categories: false }));
                    return of(null);
                  }),
                ),
              );
            }
            return combineLatest(req);
          }),
        )
        .subscribe(),
    );
  }

  ngOnDestroy(): void {
    this.suscription.forEach((i) => i.unsubscribe());
    this.defaultDataEffect.destroy();
    this.categoriesEffect.destroy();
  }

  selectCategory(item: IInvCategory | undefined) {
    if (this.selectedCategory()?.id !== item?.id) {
      this.selectedSubCategory.update(() => undefined);
      this.selectedAttributes.update(() => []);
    }
    this.selectedCategory.update(() => item);
  }
  selectSubcategory(item: IInvSubCategory | undefined) {
    if (this.selectedSubCategory()?.id !== item?.id) this.selectedAttributes.update(() => []);
    this.selectedSubCategory.update(() => item);
  }
  refreshCategories() {
    this.refreshSubject.next('categories');
  }
  selectBrand(item: IInvBrand | undefined) {
    this.selectedBrand.update(() => item);
  }
  refreshBrands() {
    this.refreshSubject.next('brand');
  }
  selectAttr(items: IInvAttrItem[]) {
    this.selectedAttributes.update(() => items);
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
    if (brand && cty && sCty) {
      const saveData: ISaveDataInventaryCreate = {
        id_marca: brand,
        codigo: this.formData['codigo'],
        id_sub_categoria: sCty,
        costo: +this.formData['costo'],
        descripcion: this.formData['descripcion'],
        stock: +this.formData['stock'],
        stock_minimo: +this.formData['stock_minimo'],
        attributes: this.selectedAttributes(),
        packs: this.selectedPacks(),
      };
      if (this.rewriteSave()) this.onSave.emit(saveData);
      else
        this.invHttpService
          .insertProduct({
            id_marca: saveData.id_marca,
            codigo: saveData.codigo,
            id_sub_categoria: saveData.id_sub_categoria,
            costo: saveData.costo,
            descripcion: saveData.descripcion,
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
                this.invHttpService.insertProductAttr(id, this.selectedAttributes()),
                this.invHttpService.insertProductPack(id, this.selectedPacks()),
              ];

              return forkJoin(inserts);
            }),
          )
          .subscribe({
            next: () => {
              this.notify.success('Articulo Creado correctamente!');
              if (this.redirectToInvAfterSave()) {
                this.router.navigateByUrl('inventary');
              } else {
                // this.router.navigate([{ outlets: { modal: null } }], { relativeTo: this.route.parent });
                this.location.back();
              }

              this.onSave.emit(saveData);
            },
            error: (err) => {
              this.notify.error('Ocurrio un error al crear el producto');
            },
          }); 
    }
  }

  goBack() {
    this.location.back();
  }
}
