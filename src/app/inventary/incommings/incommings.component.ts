import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

// Servicio
import { InventaryHttpsService } from '../../inventary/services/inventary-https.service';

// Componentes Standalone
import { BreadcrumbsComponent } from "../../components/Breadcrumbs/breadcrumbs.component";
import { PaginationComponent } from "../../components/pagination/pagination.component";

interface Producto {
  id: number;
  costo: number;
  codigo: string;
  descripcion: string;
  marca: { nombre: string; icono: string };
  sub_categoria: { 
    nombre: string; 
    icono: string;
    categoria: { nombre: string; icono: string };
  };
  articulo_variante_atr_val?: any[];
}

interface DetalleProducto {
  category: string;
  subCategory: string;
  brand: string;
  cost: number;
  code: string;
  model: string;
  size: string;
  color: string;
  material: string;
}

@Component({
  selector: 'incommings-page',
  templateUrl: 'incommings.component.html',
  styleUrl: 'incommings.component.scss',
  standalone: true, 
  imports: [
    CommonModule, 
    FormsModule,
    RouterModule,
    BreadcrumbsComponent, 
    PaginationComponent
  ]
})
export class IncommingsComponent implements OnInit {
  
  // Búsqueda
  searchTerm: string = '';
  products: Producto[] = [];
  filteredProducts: Producto[] = [];
  
  // Gestión de Modales
  showModal: boolean = false; 
  isCreateModalActive: boolean = false; 

  // La "Cesta" de productos para la tabla
  selectedProductsList: any[] = []; 
  
  // Producto que se está configurando actualmente
  currentProductEditing: Producto | null = null;

  details: DetalleProducto = {
    category: '', subCategory: '', brand: '',
    cost: 0, code: '', model: '',
    size: '', color: '', material: ''
  };

  constructor(
    private inventoryService: InventaryHttpsService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.isCreateModalActive = this.router.url.includes('modal:create');
    });
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.inventoryService.getInventary().subscribe({
      next: (res: any) => {
        this.products = (res.data || []);
      },
      error: (err: any) => console.error('Error al cargar inventario:', err)
    });
  }

  onSearch(event: any): void {
    const value = (event.target as HTMLInputElement).value.toLowerCase().trim();
    this.searchTerm = value;
    if (!value) {
      this.filteredProducts = [];
      return;
    }
    this.filteredProducts = this.products.filter(p => 
      p.descripcion?.toLowerCase().includes(value) || 
      p.codigo?.toLowerCase().includes(value) ||
      p.marca?.nombre?.toLowerCase().includes(value)
    );
  }

  selectItem(item: Producto): void {
    this.currentProductEditing = item;
    this.searchTerm = item.descripcion;
    this.filteredProducts = []; 

    // Reset de los campos del modal con info base
    this.details = {
      category: item.sub_categoria?.categoria?.nombre || '',
      subCategory: item.sub_categoria?.nombre || '',
      brand: item.marca?.nombre || '',
      cost: item.costo || 0,
      code: item.codigo || '',
      model: '', size: '', color: '', material: ''
    };

    // Mapeo de atributos
    item.articulo_variante_atr_val?.forEach(rel => {
      const nom = rel.atr_val?.atributo?.nombre?.toLowerCase() || '';
      const val = rel.atr_val?.valor || '';
      if (nom.includes("color")) this.details.color = val;
      if (nom.includes("talla") || nom.includes("size")) this.details.size = val;
      if (nom.includes("material")) this.details.material = val;
      if (nom.includes("modelo")) this.details.model = val;
    });
  }

  openModal(): void {
    if (this.currentProductEditing) this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  confirmAdd(): void {
    if (this.currentProductEditing) {
      // Creamos el objeto para la tabla
      const itemParaLista = {
        id: this.currentProductEditing.id,
        descripcion: this.currentProductEditing.descripcion,
        marca: this.currentProductEditing.marca.nombre,
        codigo: this.details.code,
        costo: this.details.cost,
        meta: { ...this.details } // Guardamos todo por si acaso
      };

      this.selectedProductsList.push(itemParaLista);
      
      // Limpieza para el siguiente producto
      this.closeModal();
      this.currentProductEditing = null;
      this.searchTerm = '';
    }
  }

  removeItem(index: number): void {
    this.selectedProductsList.splice(index, 1);
  }

  redirectToCreate(): void {
    // Usamos navegación absoluta para evitar problemas de rutas relativas
    this.router.navigate(['/inventary/incommings', { outlets: { modal: ['create'] } }]);
  }

  closeCreateModal(): void {
    this.router.navigate(['/inventary/incommings', { outlets: { modal: null } }]);
  }
  
  registrarEntradaCompleta(): void {
    console.log('Enviando a base de datos:', this.selectedProductsList);
    // Aquí llamarías a tu servicio de inserción masiva
  }
}