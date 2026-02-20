import { Component, OnInit, signal } from '@angular/core';
import { BreadcrumbsComponent } from "../components/Breadcrumbs/breadcrumbs.component";
import { IconComponent } from '../components/Icon/icon.component';
import { disableModalComponent } from './components/disableModal.component';
import { CategoriesServices } from './services/categories.services';
import { catchError, filter, map, of, switchMap, tap, BehaviorSubject } from 'rxjs';
import { IpaginationCat, ICategories } from './interfaces/categories.interface'
import { IpaginationBrand } from './interfaces/brand.interface';
import { IpaginationAttr } from './interfaces/attributes.interface';
import { IModal } from './interfaces/components.interface'
import { NgClass } from "@angular/common";

@Component({
  selector: 'categories-page',
  templateUrl: 'categories.component.html',
  styleUrl: 'categories.component.scss',
  imports: [BreadcrumbsComponent, IconComponent, NgClass, disableModalComponent],
})
export class CategoriesComponent implements OnInit {
  constructor(private categoriesService: CategoriesServices) {}
  
  paginationCat = signal<IpaginationCat>({categories: [], totalRecords: 0, totalPages: 0});
  catSelected = signal<ICategories>({id: 0, name : "", active: false, icon: "", subcategories: [], p_record: 0});

  paginationBrand = signal<IpaginationBrand>({brands: [], totalRecords : 0, totalPages: 0});
  paginationAttr = signal<IpaginationAttr>({attributes: [], totalRecords : 0, totalPages: 0});
  loading = signal<boolean>(false);

  modal = signal<IModal>({isOpen: false, type: "", textQuestion: "", textAdditional: ""});

  ngOnInit() {
    this.loadInfo();
  }

  loadInfo(limit: number = 10){
    this.loading.set(true);
    this.categoriesService.getBrands()
    .pipe(
      tap(({ data, count }) => {
        this.paginationBrand.set({
          brands: data ?? [],
          totalRecords: count ?? 0,
          totalPages: Math.ceil((count ?? 0) / limit)
        });

      }),
      catchError((e) => {
        return of(null);
      }),
      switchMap(() => {
        return this.categoriesService.getAtrs()
        .pipe(
          tap(({data, count}) => {
            this.paginationAttr.set({
              attributes: data ?? [],
              totalRecords: count ?? 0,
              totalPages: Math.ceil((count ?? 0) / limit)
            });
          })
        )
      }),
      switchMap(() => {
        return this.categoriesService.getCats()
        .pipe(
          tap(({data, count}) => {
            this.paginationCat.set({
              categories: data ?? [],
              totalRecords: count ?? 0,
              totalPages: Math.ceil((count ?? 0) / limit)
            });

            if (data && data.length > 0) {
              this.catSelected.set(data[0]);
            }
          })
        )
      })
    )
    .subscribe(() => {
      this.loading.set(false);
    });
  }

  // Funcionalidad panel de categorias
  // ** Metodo de seleccion de categoria
  selectCat(cat: ICategories){
    this.catSelected.set(cat);
  }

  // ** Metodo para editar categoria
  editCat(cat:ICategories, event: MouseEvent){
    event.stopPropagation();
  }

  // ** Metodo para inactivar una categoria
  showDisableModal(type: number, item:ICategories, event: MouseEvent){
    event.stopPropagation();
    if(type == 1){
      this.modal
      .set({
            isOpen: true, 
            type: "categoria", 
            textQuestion: "¿Estas seguro?", 
            textAdditional: "Desea deshabilitar la categoria", 
            item: item
          });
    }
  }

  disable(){
    const { type, item } = this.modal();

    if (!item) return;

    this.categoriesService
      .updateState(type, item.id, item.active)
      .subscribe();
    }
}
