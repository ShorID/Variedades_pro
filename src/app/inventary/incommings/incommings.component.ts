import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

// Servicio e Interfaces
import { InventaryHttpsService } from '../../inventary/services/inventary-https.service';

// Componentes Standalone
import { BreadcrumbsComponent } from "../../components/Breadcrumbs/breadcrumbs.component";
import { PaginationComponent } from "../../components/pagination/pagination.component";

interface Producto {
  id: number;
  costo: number;
  codigo: string;
  descripcion: string;
  name?: string; 
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
    RouterModule, // Necesario para Named Outlets
    BreadcrumbsComponent, 
    PaginationComponent
  ]
})
export class IncommingsComponent implements OnInit {
  
  // Estado de Búsqueda y Lista
  searchTerm: string = '';
  products: Producto[] = [];
  filteredProducts: Producto[] = [];
  
  // Estado de Modales
  showModal: boolean = false; // Modal de "Agregar/Configurar" (Manual)
  isCreateModalActive: boolean = false; // Modal de "Crear Producto" (Ruta Auxiliar)
  
  selectedProduct: Producto | null = null;

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
    // Escuchar cambios en la URL para activar/desactivar visualmente el modal de creación
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.isCreateModalActive = this.router.url.includes('modal:create');
    });
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  // --- Lógica de Datos ---

  loadProducts(): void {
    this.inventoryService.getInventary().subscribe({
      next: (res: any) => {
        // Mapeamos para que 'name' sea igual a 'descripcion' para compatibilidad
        this.products = (res.data || []).map((p: any) => ({ 
          ...p, 
          name: p.descripcion 
        }));
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
    this.selectedProduct = item;
    this.searchTerm = item.descripcion;
    this.filteredProducts = []; 

    // Reset de detalles con info del item
    this.details = {
      category: item.sub_categoria?.categoria?.nombre || '',
      subCategory: item.sub_categoria?.nombre || '',
      brand: item.marca?.nombre || '',
      cost: item.costo || 0,
      code: item.codigo || '',
      model: '', size: '', color: '', material: ''
    };

    // Mapeo dinámico de atributos desde el esquema SQL
    item.articulo_variante_atr_val?.forEach(rel => {
      const nom = rel.atr_val?.atributo?.nombre?.toLowerCase() || '';
      const val = rel.atr_val?.valor || '';
      if (nom.includes("color")) this.details.color = val;
      if (nom.includes("talla") || nom.includes("size")) this.details.size = val;
      if (nom.includes("material")) this.details.material = val;
      if (nom.includes("modelo")) this.details.model = val;
    });
  }

  // --- Manejo del Modal de Configuración (Agregar) ---

  openModal(): void {
    if (this.selectedProduct) this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  confirmAdd(): void {
    console.log('Confirmando ingreso de producto:', this.details);
    // Aquí iría la lógica para guardar la entrada en la BD
    this.closeModal();
    this.selectedProduct = null;
    this.searchTerm = '';
  }

  // --- Manejo del Modal de Creación (Ruta Auxiliar) ---

  redirectToCreate(): void {
    // Navega a la ruta actual activando el outlet 'modal' con el componente 'create'
    // Se usa parent para asegurar que la ruta se resuelva desde /inventary
    
    this.router.navigate([ '/inventary/incommings', { outlets: { modal: ['create'] } }]);
  }

  closeCreateModal(): void {
    // Cierra el modal de ruta auxiliar limpiando el outlet
    this.router.navigate([{ outlets: { modal: null } }], { 
      relativeTo: this.route.parent 
    });
  }

}