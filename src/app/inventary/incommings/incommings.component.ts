import { Component, OnInit, HostListener, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';
import { NotifyService } from '../../services/notify.service';

import { InventaryHttpsService } from '../incommings/services/incommings-https.service';
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
  imports: [CommonModule, FormsModule, RouterModule, InventaryCreateComponent]
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


  atributosDinamicos: { id_atributo?: number, nombre: string, valor: string }[] = [];
  listaAtributosMaestra: any[] = [];
  details: any = {
    category: '', subCategory: '', brand: '',
    cost: 0, code: '', attributes: '',
    stockActual: 0, cantidadSumar: 1
  };

  constructor(
    private inventoryService: InventaryHttpsService,
    private notify: NotifyService,
    private router: Router,
    private route: ActivatedRoute,
    private eRef: ElementRef,
    private cdr: ChangeDetectorRef
  ) {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      this.isCreateModalActive = this.router.url.includes('modal:create');
    });
  }

  ngOnInit(): void { this.loadProducts(); this.initAtributosMaestros();}

  loadProducts(): void {
    this.inventoryService.getInventary().subscribe({
      next: (res: any) => this.products = res.data || [],
      error: (err) => console.error('Error al cargar productos:', err)
    });
  }


  initAtributosMaestros() {
    this.inventoryService.getAtributosMaestros().subscribe({
      next: (data) => {
        this.listaAtributosMaestra = data;
      },
      error: (err) => {
        console.error('Error cargando atributos maestros:', err);
        this.notify.error('No se pudieron cargar los tipos de atributos.');
      }
    });
  }

  formatAttributes(item: Producto): string {
    if (!item?.articulo_variante_atr_val || !Array.isArray(item.articulo_variante_atr_val)) return '';
    return item.articulo_variante_atr_val
      .map(rel => {
        const nombreAtr = rel?.atr_val?.atributo?.nombre || '';
        const valorAtr = rel?.atr_val?.valor || '';
        return (nombreAtr && valorAtr) ? `${nombreAtr}: ${valorAtr}` : '';
      })
      .filter(str => str !== '').join(', ');
  }

  onSearch(event: any): void {
    const value = (event.target as HTMLInputElement).value.toLowerCase().trim();
    this.searchTerm = value;

    if (!value) {
      this.filteredProducts = [];
      return;
    }

    const selectedIds = this.selectedProductsList.map(item => item.id_variante);

    this.filteredProducts = this.products.filter(p => {
      if (selectedIds.includes(p.id)) return false;

      const desc = (p.descripcion || '').toLowerCase();
      const cod = (p.codigo || '').toLowerCase();
      const marc = (p.marca?.nombre || '').toLowerCase();
      const cat = (p.sub_categoria?.nombre || '').toLowerCase();
      // const attrs = this.formatAttributes(p).toLowerCase();
      // || attrs.includes(value)
      return desc.includes(value) || cod.includes(value) || marc.includes(value) || cat.includes(value);
    });
  }

  selectItem(item: any): void {
    this.currentProductEditing = item;
    this.searchTerm = item.descripcion;
    this.filteredProducts = [];

    this.atributosDinamicos = item.articulo_variante_atr_val?.map((rel: any) => ({
      id_atributo: rel.atr_val?.atributo?.id,
      nombre: rel.atr_val?.atributo?.nombre,
      valor: rel.atr_val?.valor || ''
    })) || [];
    
    if (this.atributosDinamicos.length === 0) {
      this.agregarAtributoVacio();
    }

    const stockBase = item.inventario?.[0]?.stock || 0;
    this.details = {
      sub: item.sub_categoria?.nombre || '',
      brand: item.marca?.nombre || '',
      cost: item.costo || 0,
      code: item.codigo || '',
      stockActual: stockBase,
      cantidadSumar: 1
    };
  }

  
  openModal(): void { this.filteredProducts = []; if (this.currentProductEditing) this.showModal = true; }
  closeModal(): void { this.showModal = false; this.isCreateModalActive = false; }

  confirmAdd(): void {
    if (this.currentProductEditing) {
      const atributosValidos = this.atributosDinamicos.filter(a => a.id_atributo && a.valor.trim() !== '');  

      const itemParaLista = {
        id_variante: this.currentProductEditing.id,
        descripcion: this.currentProductEditing.descripcion,
        sub: this.currentProductEditing?.sub_categoria?.nombre,
        marca: this.details.brand,
        codigo: this.details.code,
        costo: this.details.cost,
        stockPrevio: this.details.stockActual,
        cantidadIngreso: this.details.cantidadSumar,
        stockFinal: this.details.stockActual + this.details.cantidadSumar,

        atributosArray: atributosValidos,
        atributosFinales: atributosValidos.map(a => {
          const nombreAtr = this.listaAtributosMaestra.find(m => m.id === a.id_atributo)?.nombre;
          return `${nombreAtr}: ${a.valor}`;
        }).join(' | ')
      };

      this.selectedProductsList.push(itemParaLista);
      this.closeModal();
      this.currentProductEditing = null;
      this.cdr.detectChanges();
    }
  }

  removeItem(index: number): void { this.selectedProductsList.splice(index, 1); }

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (!this.eRef.nativeElement.contains(event.target)) this.filteredProducts = [];
  }

  async registrarEntradaCompleta() {
    if (this.selectedProductsList.length === 0 || this.isSaving) return;

    this.isSaving = true;
    this.cdr.detectChanges();

    let exitosos = 0;
    let fallidos = 0;

    try {
      for (const item of this.selectedProductsList) {
        try {
          await firstValueFrom(this.inventoryService.updateStock(item.id_variante, item.stockFinal));

          await firstValueFrom(this.inventoryService.updateVariante(item.id_variante, { costo: item.costo, codigo: item.codigo }));

          if (item.atributosArray && item.atributosArray.length > 0) {
            await this.inventoryService.linkAttributesToVariant(item.id_variante, item.atributosArray);
          }
          console.log("producto.>  " + JSON.stringify(item));

          exitosos++;
        } catch (err) {
          console.error(`Error procesando ${item.descripcion}:`, err);
          fallidos++;
        }
      }

      if (fallidos === 0) {
        this.notify.success(`✅ ¡Éxito!\n Se procesaron ${exitosos} productos correctamente.`);
      } else {
        this.notify.error(`⚠️ Finalizado con errores: ${exitosos} exitosos, ${fallidos} fallidos.`);
      }

      this.selectedProductsList = [];
      this.loadProducts();

    } catch (err) {
      console.error('Error crítico en el proceso:', err);
      this.notify.info('❌ Ocurrió un error inesperado al procesar la carga.');
    } finally {
      this.isSaving = false;
      this.cdr.detectChanges();
      console.log("Estado isSaving final:", this.isSaving);
    }
  }

  agregarAtributoVacio() {
    this.atributosDinamicos.push({ id_atributo: undefined, nombre: '', valor: '' });
  }

  eliminarAtributo(index: number) {
    this.atributosDinamicos.splice(index, 1);
  }

  redirectToCreate(): void { this.router.navigate(['/inventary/incommings', { outlets: { modal: ['create'] } }]); }
  closeCreateModal(): void { this.router.navigate(['/inventary/incommings', { outlets: { modal: null } }]); }
}