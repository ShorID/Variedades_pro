import { Component, OnInit, signal } from '@angular/core';
import { BreadcrumbsComponent } from "../components/Breadcrumbs/breadcrumbs.component";
import { IconComponent } from '../components/Icon/icon.component';
import { disableModalComponent } from './components/disableModal.component';
import { CategoriesServices } from './services/categories.services';
import { catchError, filter, map, of, switchMap, tap, BehaviorSubject, EMPTY } from 'rxjs';
import { IpaginationCat, ICategories, IpaginationSubCat } from './interfaces/categories.interface';
import { IBrand, IpaginationBrand } from './interfaces/brand.interface';
import { IAttribute, IpaginationAttr } from './interfaces/attributes.interface';
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
  
  // Variables de seleccion
  catSelected = signal<ICategories>({id: 0, name : "", active: false, icon: "", sc_record: 0, p_record: 0});

  // Variables para paginacion
  paginationCat = signal<IpaginationCat>({categories: [], totalRecords: 0, totalPages: 0});
  paginationSubCat = signal<IpaginationSubCat>({Subcategories: [], totalRecords: 0, totalPages: 0});
  paginationBrand = signal<IpaginationBrand>({brands: [], totalRecords : 0, totalPages: 0});
  paginationAttr = signal<IpaginationAttr>({attributes: [], totalRecords : 0, totalPages: 0});

  // Variables de carga
  loadingCat = signal<boolean>(false);
  loadingSubcat = signal<boolean>(false);
  loadingBrand = signal<boolean>(false);
  loadingattr = signal<boolean>(false);

  modal = signal<IModal>({isOpen: false, type: "", textQuestion: "", textAdditional: "", textbold: ""});
  limit = signal<number>(10);

  ngOnInit() {
    this.loadInfo();
  }

  // Carga toda la info de inicio
  loadInfo(){
    this.loadingCat.set(true);
    this.loadingSubcat.set(true);
    this.loadingBrand.set(true);
    this.loadingattr.set(true);

    this.categoriesService.getBrands()
    .pipe(
      tap(({ data, count }) => {
        this.paginationBrand.set({
          brands: data ?? [],
          totalRecords: count ?? 0,
          totalPages: Math.ceil((count ?? 0) / this.limit())
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
              totalPages: Math.ceil((count ?? 0) / this.limit())
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
              totalPages: Math.ceil((count ?? 0) / this.limit())
            });

            if (data && data.length > 0) {
              this.catSelected.set(data[0]);
            }
          })
        )
        
      }),
      switchMap(() => {
        return this.categoriesService.getSubCats(this.catSelected().id)
        .pipe(
          tap(({data, count}) => {
            this.paginationSubCat.set({
              Subcategories: data ?? [],
              totalRecords: count ?? 0,
              totalPages: Math.ceil((count ?? 0) / this.limit())
            });
          })
        )
      })
    )
    .subscribe(() => {
      this.loadingCat.set(false);
      this.loadingSubcat.set(false);
      this.loadingBrand.set(false);
      this.loadingattr.set(false);
    });
  }

  // Funcionalidad panel de categorias
  // ** Metodo de seleccion de categoria
  selectCat(cat: ICategories){
    this.loadingSubcat.set(true);
    this.catSelected.set(cat);
    this.categoriesService.getSubCats(this.catSelected().id)
    .pipe(
      tap(({data, count}) => {
        this.paginationSubCat.set({
          Subcategories: data ?? [],
          totalRecords: count ?? 0,
          totalPages: Math.ceil((count ?? 0) / this.limit())
        });
      })
    ).
    subscribe(() => {
      this.loadingSubcat.set(false);
    });
  }

  // ** Metodo para editar categoria
  editCat(cat:ICategories, event: MouseEvent){
    event.stopPropagation();
  }

  // ** Metodo para inactivar una categoria
  showDisableModal(type: number, item: ICategories | IBrand | IAttribute, event: MouseEvent, additional: string = ""){
    event.stopPropagation();

    if(!item) return;

    if(type === 1 && 'name' in item){
      this.modal.set({
        isOpen: true,
        type: "categoria",
        textQuestion: "¿Estas seguro?",
        textAdditional: `Desea ${item.active ? "deshabilitar" : "habilitar"} la categoria`,
        textbold: item.name,
        item: item
      });

    } else if(type === 2 && 'name' in item){
      this.modal.set({
        isOpen: true,
        type: "marca",
        textQuestion: "¿Estas seguro?",
        textAdditional: `Desea ${item.active ? "deshabilitar" : "habilitar"} la marca`,
        textbold: item.name,
        item: item
      });

    } else if(type === 3 && 'value' in item){
      this.modal.set({
        isOpen: true,
        type: "atr_val",
        textQuestion: "¿Estas seguro?",
        textAdditional: `Desea ${item.active ? "deshabilitar" : "habilitar"} el atributo`,
        textbold: `${additional}: ${item.value}`,
        item: item
      });
    }
  }

  disable(){
    const { type, item } = this.modal();
    this.modal.update((obj) => {
      obj.isOpen = false;
      return obj;
    });

    if (!item) return;

    if(type == "categoria")
      this.loadingCat.set(true);
    else if(type == "marca")
      this.loadingBrand.set(true);
    else if(type == "atr_val")
      this.loadingattr.set(true);

    this.categoriesService
    .updateState(type, item.id, item.active)
    .pipe(
      switchMap(() =>{
        switch (type) {
          case "categoria":
            return this.categoriesService.getCats()
            .pipe(
              tap(({data, count}) => {
                this.paginationCat.set({
                  categories: data ?? [],
                  totalRecords: count ?? 0,
                  totalPages: Math.ceil((count ?? 0) / this.limit())
                });
              })
            );

          case "marca":
            return this.categoriesService.getBrands()
            .pipe(
              tap(({data, count}) => {
                this.paginationBrand.set({
                  brands: data ?? [],
                  totalRecords: count ?? 0,
                  totalPages: Math.ceil((count ?? 0) / this.limit())
                });
              })
            );

          case "atr_val":
            return this.categoriesService.getAtrs()
            .pipe(
              tap(({data, count}) => {
                this.paginationAttr.set({
                  attributes: data ?? [],
                  totalRecords: count ?? 0,
                  totalPages: Math.ceil((count ?? 0) / this.limit())
                });
              })
            );

          default:
            return EMPTY;
        }
      })
    )
    .subscribe(() => {
      if(type == "categoria")
        this.loadingCat.set(false);
      else if(type == "marca")
        this.loadingBrand.set(false);
      else if(type == "atr_val")
        this.loadingattr.set(false);
    });
  }
}
