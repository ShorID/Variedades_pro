import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';

import { InventaryHttpsService } from '../incommings/services/incommings-https.service';
import { BreadcrumbsComponent } from "../../components/Breadcrumbs/breadcrumbs.component";
import { PaginationComponent } from "../../components/pagination/pagination.component";
import { InventaryCreateComponent } from "../components/inventary-create/inventary-create.component";

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
  inventario: { stock: number }[];
  articulo_variante_atr_val?: any[];
}

@Component({
  selector: 'incommings-page',
  templateUrl: 'incommings.component.html',
  styleUrl: 'incommings.component.scss',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, BreadcrumbsComponent, PaginationComponent, InventaryCreateComponent]
})
export class IncommingsComponent implements OnInit {
  searchTerm: string = '';
  products: Producto[] = [];
  filteredProducts: Producto[] = [];

  showModal: boolean = false;
  isCreateModalActive: boolean = false;
  isSaving: boolean = false;

  selectedProductsList: any[] = [];
  currentProductEditing: Producto | null = null;

  details: any = {
    category: '', subCategory: '', brand: '',
    cost: 0, code: '', model: '',
    size: '', color: '', material: '',
    stockActual: 0, cantidadSumar: 1
  };

  constructor(
    private inventoryService: InventaryHttpsService,
    private router: Router,
    private route: ActivatedRoute,
    private eRef: ElementRef
  ) {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      this.isCreateModalActive = this.router.url.includes('modal:create');
    });
  }

  ngOnInit(): void { this.loadProducts(); }

  loadProducts(): void {
    this.inventoryService.getInventary().subscribe({
      next: (res: any) => this.products = res.data || [],
      error: (err) => console.error('Error:', err)
    });
  }

  onSearch(event: any): void {
    const value = (event.target as HTMLInputElement).value.toLowerCase().trim();
    this.searchTerm = value;
    this.filteredProducts = value ? this.products.filter(p =>
      p.descripcion?.toLowerCase().includes(value) ||
      p.codigo?.toLowerCase().includes(value) ||
      p.marca?.nombre?.toLowerCase().includes(value)
    ) : [];
  }

  selectItem(item: Producto): void {
    this.currentProductEditing = item;
    this.searchTerm = item.descripcion;
    this.filteredProducts = [];

    const stockBase = item.inventario && item.inventario.length > 0 ? item.inventario[0].stock : 0;

    this.details = {
      category: item.sub_categoria?.categoria?.nombre || '',
      subCategory: item.sub_categoria?.nombre || '',
      brand: item.marca?.nombre || '',
      cost: item.costo || 0,
      code: item.codigo || '',
      stockActual: stockBase,
      cantidadSumar: 1
    };
  }

  openModal(): void { if (this.currentProductEditing) this.showModal = true; }
  closeModal(): void { this.showModal = false; this.isCreateModalActive = false; }

  confirmAdd(): void {
    if (this.currentProductEditing && this.details.cantidadSumar > 0) {
      this.selectedProductsList.push({
        id_variante: this.currentProductEditing.id,
        descripcion: this.currentProductEditing.descripcion,
        marca: this.currentProductEditing.marca.nombre,
        codigo: this.details.code,
        costo: this.details.cost,
        stockPrevio: this.details.stockActual,
        cantidadIngreso: this.details.cantidadSumar,
        stockFinal: this.details.stockActual + this.details.cantidadSumar
      });
      this.closeModal();
      this.currentProductEditing = null;
      this.searchTerm = '';
    }
  }

  removeItem(index: number): void { this.selectedProductsList.splice(index, 1); }

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.filteredProducts = []; 
    }
  }

  async registrarEntradaCompleta() {
    if (this.selectedProductsList.length === 0) return;

    this.isSaving = true;
    let exitosos = 0;
    let fallidos = 0;

    try {
      for (const item of this.selectedProductsList) {
        try {
          await firstValueFrom(this.inventoryService.updateStock(item.id_variante, item.stockFinal));
          exitosos++;
        } catch (err) {
          console.error(`Error con el producto ${item.descripcion}:`, err);
          fallidos++;
        }
      }

      if (fallidos === 0) {
        alert(`✅ ¡Éxito! Se actualizaron ${exitosos} productos correctamente.`);
      } else {
        alert(`⚠️ Proceso terminado con advertencias: ${exitosos} exitosos, ${fallidos} fallidos.`);
      }

      this.selectedProductsList = [];
      this.loadProducts(); 

    } catch (globalError) {
      alert('❌ Error crítico en el proceso de registro.');
    } finally {
      this.isSaving = false;
    }
  }

  redirectToCreate(): void { this.router.navigate(['/inventary/incommings', { outlets: { modal: ['create'] } }]); }
  closeCreateModal(): void { this.router.navigate(['/inventary/incommings', { outlets: { modal: null } }]); }
}