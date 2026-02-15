import { Component, computed, OnInit, signal } from '@angular/core';
import { InventaryHttpsService } from '../../services/inventary-https.service';
import { filter, map, switchMap, tap } from 'rxjs';
import { TextComponent } from '../../../components/Text/text.component';
import { IBrand } from '../../../categories/brands/interfaces/brand.interface';
import { BrandSelectorComponent } from '../../../categories/brands/components/brand-selector.component';
import { InputComponent } from '../../../components/Form/Input/Input.component';
import { CategoriesSelectorComponent } from '../../../categories/components/category-selector-card/category-selector-card.component';
import { ICategories, ISubCategories } from '../../../categories/interfaces/categories.interface';
import { NameComponent } from '../../../categories/components/subcategory-selector-card/subcategory-selector-card.component';

@Component({
  selector: 'page-inventary-create',
  templateUrl: './inventary-create.component.html',
  imports: [
    TextComponent,
    BrandSelectorComponent,
    InputComponent,
    CategoriesSelectorComponent,
    NameComponent,
  ],
})
export class InventaryCreateComponent implements OnInit {
  brands = signal<IBrand[]>([]);
  categories = signal<ICategories[]>([]);
  selectedBrand = signal<IBrand | undefined>(undefined);
  selectedSubCategory = signal<ISubCategories | undefined>(undefined);
  selectedCategory = signal<ICategories | undefined>(undefined);
  subcategories = computed(() => {
    if (this.selectedCategory()) {
      const newSubcategories = this.categories().find(
        (item) => item.id === this.selectedCategory()?.id,
      );
      return newSubcategories?.sub_categoria || [];
    }
    return [];
  });
  showValidations = signal<boolean>(false);
  formData: Record<string, string> = {
    nombre: '',
    codigo: '',
    modelo: '',
  };

  constructor(private invHttpService: InventaryHttpsService) {}

  ngOnInit() {
    this.invHttpService
      .getCategories()
      .pipe(tap(({ data }) => data && this.categories.set(data)))
      .subscribe();
    this.invHttpService
      .getBrands()
      .pipe(tap(({ data }) => data && this.brands.set(data)))
      .subscribe();
  }

  selectCategory(item: ICategories | undefined) {
    this.selectedCategory.update(() => item);
  }
  selectSubcategory(item: ISubCategories | undefined) {
    this.selectedSubCategory.update(() => item);
  }
  selectBrand(item: IBrand | undefined) {
    this.selectedBrand.update(() => item);
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
          modelo: this.formData['modelo'],
          nombre: this.formData['nombre'],
        })
        .pipe(
          map(({ data }) => {
            if (data?.length) return data[0].id;
            return null;
          }),
          filter((res) => !!res),
          switchMap((id) => {
            return this.invHttpService.insertProductVariant({
              codigo: this.formData['codigo'],
              costo: this.formData['costo'],
              id_articulo: id,
            });
          }),
        ).subscribe();
  }
}
