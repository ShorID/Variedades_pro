//Dependencias
import { Component, OnInit, Signal, signal } from '@angular/core';
import { CategoriesServices } from './services/categories.services';
import { catchError, of, switchMap, tap, EMPTY, map } from 'rxjs';
import { NgClass } from "@angular/common"

//Componentes
import { IconComponent } from '../components/Icon/icon.component';
import { InputComponent } from '../components/Form/Input/Input.component';
import { modalComponent } from './components/modal.component';
import { bodyDisable } from './components/disable-selector/bodyDisable.component';;
import { footerDisable } from "./components/disable-selector/footerDisable.component";
import { bodyAddEditAttrComponent } from './attributes/components/addEditAttr-selector/bodyAddEditAttr.component'
import { bodyAddEditComponent } from "./components/addEdit-selector/bodyAddEdit.component";
import { headerAddEditComponent } from "./components/addEdit-selector/headerAddEdit.component";
import { footerAddEditComponent } from "./components/addEdit-selector/footerAddEdit.component";
import { headerManageAttrValue } from "./components/manageAttrValue-selector/headerManageAttrValue.component";

//Interfaces
import { IpaginationCat, ICategories, IpaginationSubCat, IinsertUpdateCat, IinsertUpdateSubCat } from './interfaces/categories.interface';
import { IBrand, IpaginationBrand, IinsertUpdateBrand } from './interfaces/brand.interface';
import { IAttribute, IpaginationAttr, IinsertUpdateAttr } from './interfaces/attributes.interface';
import { IdisableModal, IaddEditModal, IaddEditAttrModal, ImanageAttrModal } from './interfaces/components.interface';

//Utilidades
import { formatName } from '../utils/commons';
import { stringify } from 'uuid';
import { FormsModule } from "@angular/forms";

@Component({
  selector: 'categories-page',
  templateUrl: 'categories.component.html',
  styleUrl: 'categories.component.scss',
  imports: [NgClass, IconComponent, InputComponent, modalComponent, bodyDisable, footerDisable, bodyAddEditComponent, bodyAddEditAttrComponent, headerAddEditComponent, footerAddEditComponent, headerManageAttrValue, FormsModule],
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

  formData = signal<Record<string, string>>({ name: '', value: ''});

  // Variables de carga
  loadingCat = signal<boolean>(false);
  loadingSubcat = signal<boolean>(false);
  loadingBrand = signal<boolean>(false);
  loadingattr = signal<boolean>(false);
  loadingDrop = signal<boolean>(false);

  selectedAttributeId: number = -1;

  page = {category: 1, subcategory: 1, brand: 1, attribute: 1};
  filter = {category: "", subcategory: "", brand: "", attribute: ""};

  //Variables Modal
  disableModal = signal<IdisableModal>({isOpen: false, entity: "", textQuestion: "", textAdditional: "", textbold: ""});
  addEditModal = signal<IaddEditModal>({isOpen: false, entity: "", title: "", placeholder: "", action: "", errorMsg: "", value: "", itemId: -1});
  addEditAttrModal = signal<IaddEditAttrModal>({isOpen: false, entity: "", title: "", placeholder: "", action: "", errorMsg: "", options: [], value: "", itemId: -1});
  manageAttrModal = signal<ImanageAttrModal>({isOpen: false, title: "Administrar atributos", options: []});
  // addEditAttrModal = signal<>();

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

  // ** Metodo para visualizar modal de crear o editar
  showModal(entity: number, action: string, event: Event, value: string = "", id: number = -1, attribute?: string, attributeId?:number){
    event.stopPropagation();
  
    //Bloque que sirve solo para la función de guardar
    if(action === "save"){
      if([1, 2, 3].includes(entity))
        this.formData()["name"] = "";

      if([4].includes(entity)){
        this.selectedAttributeId = -1;
        this.formData()["value"] = "";
      }

      if(entity ===1){
        this.addEditModal.set({
          isOpen: true,
          entity: "categoria",
          title: "Agregar Categoría",
          placeholder: "Ingrese la categoría",
          action: action,
          errorMsg: "",
          value: value,
          itemId: id
        });
      } else if(entity === 2){
        this.addEditModal.set({
          isOpen: true, 
          entity: "marca", 
          title: "Agregar Marca", 
          placeholder: "Ingrese la marca",
          action: action,
          errorMsg: "",
          value: value,
          itemId: id
        });
      } else if(entity === 3){
        this.addEditModal.set({
          isOpen: true, 
          entity: "sub_categoria", 
          title: "Agregar Subcategoría", 
          placeholder: "Ingrese la subcategoría",
          action: action,
          errorMsg: "",
          value: value,
          itemId: id
        });
      } else if(entity === 4) {
        this.loadingDrop.set(true);
        this.addEditAttrModal.set({
          isOpen: true, 
          entity: "atr_val", 
          title: "Agregar valor del atributo", 
          placeholder: "Ingrese el valor del atributo",
          action: action,
          errorMsg: "",
          options: [],
          value: value,
          itemId: id
        });

        this.categoriesService.fillDropdown()
        .subscribe(({data}) => {
          if(data)
            data.unshift({id:-1, nombre: "Seleccione un atributto..."});

          this.addEditAttrModal.update(obj => ({
            ...obj,
            options: data || []
          }));
          this.loadingDrop.set(false);
        });
      }
    }
    
    //Bloque que sirve solo para la función de editar
    if(action == "edit"){
      this.formData()["name"] = value;
      this.formData()["value"] = value;

      if(entity ===1){
        this.addEditModal.set({
          isOpen: true,
          entity: "categoria",
          title: "Editar Categoría",
          placeholder: "Ingrese la categoria",
          action: action,
          errorMsg: "",
          value: value,
          itemId: id
        });
      } else if(entity === 2){
        this.addEditModal.set({
          isOpen: true, 
          entity: "marca", 
          title: "Editar Marca", 
          placeholder: "Ingrese la marca",
          action: action,
          errorMsg: "",
          value: value,
          itemId: id
        });
      } else if(entity === 3){
        this.addEditModal.set({
          isOpen: true, 
          entity: "sub_categoria", 
          title: "Editar Subcategoría", 
          placeholder: "Ingrese la Subcategoría",
          action: action,
          errorMsg: "",
          value: value,
          itemId: id
        });
      } else if(entity === 4) {
        this.selectedAttributeId = attributeId || -1;

        this.addEditAttrModal.set({
          isOpen: true, 
          entity: "atr_val", 
          title: "Agregar valor del atributo", 
          placeholder: "Ingrese el valor del atributo",
          action: action,
          errorMsg: "",
          options: [{id: attributeId || 1, nombre: attribute || "hola"}],
          value: value,
          itemId: id
        });
      }
    }
  }

  // ** Metodo para visualizar modal de deshabilitar
  showDisableModal(type: number, item: ICategories | IBrand | IAttribute, event: MouseEvent, additional: string = ""){
    event.stopPropagation();

    if(!item) return;

    if(type === 1 && 'name' in item){
      this.disableModal.set({
        isOpen: true,
        entity: "categoria",
        textQuestion: "¿Estas seguro?",
        textAdditional: `Desea ${item.active ? "deshabilitar" : "habilitar"} la categoria`,
        textbold: item.name,
        item: item
      });

    } else if(type === 2 && 'name' in item){
      this.disableModal.set({
        isOpen: true,
        entity: "marca",
        textQuestion: "¿Estas seguro?",
        textAdditional: `Desea ${item.active ? "deshabilitar" : "habilitar"} la marca`,
        textbold: item.name,
        item: item
      });

    } else if(type === 3 && 'value' in item){
      this.disableModal.set({
        isOpen: true,
        entity: "atr_val",
        textQuestion: "¿Estas seguro?",
        textAdditional: `Desea ${item.active ? "deshabilitar" : "habilitar"} el atributo`,
        textbold: `${additional}: ${item.value}`,
        item: item
      });
    }
  }

  // ** Metodo para visualizar el modal de administración de productos
  showManageAttrModal(id: number){
    this.manageAttrModal.update(obj => ({
      ...obj,
      isOpen: true
    }));

    this.categoriesService.getAtrValue(id)
    .subscribe(({data}) => {
      this.manageAttrModal.update(obj => ({
        ...obj,
        options: data || []
      }));
    });
  }

  // ** Metodo que deshabilita las categorias, subcategorias, marcas y atributos
  disable(){
    const { entity, item } = this.disableModal();

    this.disableModal.update(obj => ({
      ...obj,
      isOpen: false
    }));

    if (!item) return;

    this.categoriesService
    .updateState(entity, item.id, item.active)
    .pipe(
      switchMap(() =>{
        return this.loadPanel(entity);
      })
    )
    .subscribe(() => {});
  }

  // ** Metodo que recibe los datos para guardar atributo
  saveEditAttr(){
    const value = formatName(this.formData()["value"].trim());
    const { entity, action, itemId } = this.addEditAttrModal();

    this.addEditAttrModal.update(obj => ({
      ...obj,
      errorMsg: ""
    }));

    if(value === ""){
      this.addEditAttrModal.update(obj => ({
        ...obj,
        errorMsg: "Por favor, ingrese el dato solicitado"
      }));
    }else if(value == this.addEditAttrModal().value){
      this.addEditAttrModal.update(obj => ({
        ...obj,
        errorMsg: "Por favor, edite el valor"
      }));
    } else {
      this.categoriesService.checkOutAttr(value, this.selectedAttributeId)
      .pipe(
        map(res => res.data && res.data.length > 0),
        tap(exists => {
          if(exists){
            this.addEditAttrModal.update(obj => ({
              ...obj,
              errorMsg: "El nombre ya existe"
            }));
          }
        }),
        switchMap((exists) => {
          if(!exists){
            let body = this.getBodyRequest(entity, action, value, itemId);

            return this.categoriesService.addEdit(entity, action, body)
            .pipe(
              map(res => res.data && res.data.length > 0),
              switchMap((exists) =>{
                if(exists){
                  this.addEditAttrModal.update(obj => ({
                    ...obj,
                    isOpen: false
                  }));

                  return this.loadPanel(entity);
                }else 
                  return EMPTY;
              })
            )
          }else
            return EMPTY;
        }),
        catchError(err => {
          this.addEditAttrModal.update(obj => ({
            ...obj,
            errorMsg: "Ocurrió un error al guardar"
          }));

          return EMPTY; // evita que el observable rompa

        })
      )
      .subscribe(() => {});
    }
  }

  // ** Metodo que recibe los datos para guardar
  saveEdit(){
    const value = formatName(this.formData()["name"].trim());
    const { entity, action, itemId } = this.addEditModal();

    this.addEditModal.update(obj => ({
      ...obj,
      errorMsg: ""
    }));

    if(value === ""){
      this.addEditModal.update(obj => ({
        ...obj,
        errorMsg: "Por favor, ingrese el dato solicitado"
      }));
    }else if(value == this.addEditModal().value){
      this.addEditModal.update(obj => ({
        ...obj,
        errorMsg: "Por favor, edite el nombre"
      }));
    } else {

      this.categoriesService.checkOut(entity, value)
      .pipe(
        map(res => res.data && res.data.length > 0),
        tap(exists => {
          if(exists){
            this.addEditModal.update(obj => ({
              ...obj,
              errorMsg: "El nombre ya existe"
            }));
          }
        }),
        switchMap((exists) => {
          if(!exists){
            let body = this.getBodyRequest(entity, action, value, itemId);

            return this.categoriesService.addEdit(entity, action, body)
            .pipe(
              map(res => res.data && res.data.length > 0),
              switchMap((exists) =>{
                if(exists){
                  this.addEditModal.update(obj => ({
                    ...obj,
                    isOpen: false
                  }));

                  return this.loadPanel(entity);
                }else 
                  return EMPTY;
              })
            )
          }else
            return EMPTY;
        }),
        catchError(err => {
          this.addEditModal.update(obj => ({
            ...obj,
            errorMsg: "Ocurrió un error al guardar"
          }));

          return EMPTY; // evita que el observable rompa

        })
      )
      .subscribe(() => {});
    }
  }

  // ** Metodo para tomar el dato de los inputs
  changeForm(e: Event) {
    const { name, value } = e.target as HTMLInputElement;
    if (name in this.formData()) this.formData.update((prev) => ({ ...prev, [name]: value }));
  }

  // ** Metodo que carga nuevamente las vistas en los paneles
  loadPanel(entity: string){
    switch (entity) {
      case "categoria":
        this.loadingCat.set(true);

        return this.categoriesService.getCats()
        .pipe(
          tap(({data, count}) => {
            this.paginationCat.set({
              categories: data ?? [],
              totalRecords: count ?? 0,
              totalPages: Math.ceil((count ?? 0) / this.limit())
            });

            this.loadingCat.set(false)
          })
        );

      case "sub_categoria":
        this.loadingSubcat.set(true);

        return this.categoriesService.getSubCats(this.catSelected().id)
        .pipe(
          tap(({data, count}) => {
            this.paginationSubCat.set({
              Subcategories: data ?? [],
              totalRecords: count ?? 0,
              totalPages: Math.ceil((count ?? 0) / this.limit())
            });

            this.loadingSubcat.set(false);
          })
        );

      case "marca":
        this.loadingBrand.set(true);

        return this.categoriesService.getBrands()
        .pipe(
          tap(({data, count}) => {
            this.paginationBrand.set({
              brands: data ?? [],
              totalRecords: count ?? 0,
              totalPages: Math.ceil((count ?? 0) / this.limit())
            });

            this.loadingBrand.set(false);
          })
        );

      case "atr_val":
        this.loadingattr.set(true);

        return this.categoriesService.getAtrs()
        .pipe(
          tap(({data, count}) => {
            this.paginationAttr.set({
              attributes: data ?? [],
              totalRecords: count ?? 0,
              totalPages: Math.ceil((count ?? 0) / this.limit())
            });

            this.loadingattr.set(false);
          })
        );

      default:
        return EMPTY;
    }
  }

  filterPanel(entity: string){
    switch (entity) {
      case "categoria":
        this.loadingCat.set(true);

        return this.categoriesService.getCats(this.page.category, this.limit(), this.filter.category)
        .pipe(
          tap(({data, count}) => {
            this.paginationCat.set({
              categories: data ?? [],
              totalRecords: count ?? 0,
              totalPages: Math.ceil((count ?? 0) / this.limit())
            });

            this.loadingCat.set(false)
          })
        ).subscribe(() => {});

      case "sub_categoria":
        this.loadingSubcat.set(true);
        console.log(this.filter.subcategory)
        return this.categoriesService.getSubCats(this.catSelected().id, this.page.subcategory, this.limit(), this.filter.subcategory)
        .pipe(
          tap(({data, count}) => {
            this.paginationSubCat.set({
              Subcategories: data ?? [],
              totalRecords: count ?? 0,
              totalPages: Math.ceil((count ?? 0) / this.limit())
            });

            this.loadingSubcat.set(false);
          })
        ).subscribe(() => {});

      case "marca":
        this.loadingBrand.set(true);

        return this.categoriesService.getBrands(this.page.brand, this.limit(), this.filter.brand)
        .pipe(
          tap(({data, count}) => {
            this.paginationBrand.set({
              brands: data ?? [],
              totalRecords: count ?? 0,
              totalPages: Math.ceil((count ?? 0) / this.limit())
            });

            this.loadingBrand.set(false);
          })
        ).subscribe(() => {});

      case "atr_val":
        this.loadingattr.set(true);

        return this.categoriesService.getAtrs(this.page.attribute, this.limit(), this.filter.attribute)
        .pipe(
          tap(({data, count}) => {
            this.paginationAttr.set({
              attributes: data ?? [],
              totalRecords: count ?? 0,
              totalPages: Math.ceil((count ?? 0) / this.limit())
            });

            this.loadingattr.set(false);
          })
        ).subscribe(() => {});

      default:
        return EMPTY;
    }
  }

  // ** Metodo retorna el objeto necesario para la creacion o edicion de categorias, subcategorias, marcas y atributos
  getBodyRequest(entity: string, action: string, value:string, id: number): IinsertUpdateCat | IinsertUpdateSubCat | IinsertUpdateBrand | IinsertUpdateAttr{
    const base = {
      nombre: value,
      activo: true
    };

  if(entity === "categoria"){
    const body: IinsertUpdateCat = { ...base };

      if(action === "edit")
        body.id = id;

      return body;

    } else if (entity === "marca"){
      const body: IinsertUpdateBrand = { ...base };

      if(action === "edit")
        body.id = id;

      return body;

    } else if (entity === "sub_categoria"){
      const body: IinsertUpdateSubCat = { ...base };

      if(action === "save")
        body.id_categoria = this.catSelected().id;

      if(action === "edit")
        body.id = id;

      return body;

    }else if (entity === "atr_val"){
      const body: IinsertUpdateAttr = { valor: value, activo: true };

      if(action === "save")
        body.id_atributo = this.selectedAttributeId;

      if(action === "edit")
        body.id = id;

      return body;

    } else {
      throw new Error("Entidad no válida");
    } 
  }
}