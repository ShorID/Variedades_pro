import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

// Ruta de importación actualizada según tu indicación
import { InventaryHttpsService } from '../../inventary/services/inventary-https.service';

// Importación de componentes standalone (Asegúrate que los selectores en el HTML coincidan)
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
    BreadcrumbsComponent, 
    PaginationComponent
  ]
})
export class IncommingsComponent implements OnInit {
  
  searchTerm: string = '';
  products: Producto[] = [];
  filteredProducts: Producto[] = [];
  showModal: boolean = false;
  selectedProduct: Producto | null = null;

  details: DetalleProducto = {
    category: '', subCategory: '', brand: '',
    cost: 0, code: '', model: '',
    size: '', color: '', material: ''
  };

  constructor(private inventoryService: InventaryHttpsService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.inventoryService.getInventary().subscribe({
      next: (res: any) => {
        // Mapeamos para que 'name' sea igual a 'descripcion' y el HTML no dé error
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

    this.details = {
      category: item.sub_categoria?.categoria?.nombre || '',
      subCategory: item.sub_categoria?.nombre || '',
      brand: item.marca?.nombre || '',
      cost: item.costo || 0,
      code: item.codigo || '',
      model: '', size: '', color: '', material: ''
    };

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
    if (this.selectedProduct) this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  confirmAdd(): void {
    // Lógica para procesar el ingreso
    console.log('Agregando producto:', this.details);
    this.closeModal();
    this.selectedProduct = null;
    this.searchTerm = '';
  }

 redirectToCreate() {
    this.router.navigate(['create'], { relativeTo: this.route });
  }

}