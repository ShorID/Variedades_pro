import { Component, computed, input, OnInit, signal } from '@angular/core';
import { IInventaryItem } from '../../interfaces/inventary.interfaces';
import { IconComponent } from '../../../components/Icon/icon.component';
import { TextComponent } from '../../../components/Text/text.component';

@Component({
  selector: 'inventary-table',
  template: `
    <div class="card-header">
      <div class="row g-2">
        <div class="col">
          <div class="input-group input-group-flat">
            <input
              type="text"
              class="form-control"
              (input)="onSearchInput($event)"
              [value]="searchText"
              autocomplete="off"
            />
            <span class="input-group-text">
              @if (filters().q) {
                <a
                  href="#"
                  class="link-secondary"
                  (click)="clearSearch($event)"
                  title="Clear search"
                  data-bs-toggle="tooltip"
                >
                  <app-icon name="X" [size]="16" class="text-danger" />
                </a>
              } @else {
                <a
                  href="#"
                  class="link-secondary"
                  (click)="$event.preventDefault()"
                  title="search"
                  data-bs-toggle="tooltip"
                >
                  <app-icon name="Search" [size]="16" />
                </a>
              }
            </span>
          </div>
        </div>
        <div class="col">
          <div class="dropdown">
            <a href="#" class="btn dropdown-toggle" data-bs-toggle="dropdown">
                <Text tagClass="d-flex align-items-center">
                    <app-icon name='filter' class='me-1 d-block-inline' [size]="16" />
                    Subcategorias
                </Text>
            </a>
            <div class="dropdown-menu" style="z-index: 1021;">
              <a class="dropdown-item" href="#"> Action </a>
              <a class="dropdown-item" href="#"> Another action </a>
              <div class="dropdown-divider"></div>
              <a class="dropdown-item" href="#">Separated link</a>
            </div>
          </div>
        </div>
      </div>
    </div>
    <table class="table">
      <thead class="sticky-top">
        <tr>
          <th scope="col" [width]="'2rem'"></th>
          <th scope="col" [width]="'2rem'">ID</th>
          <th scope="col">Producto</th>
          <th scope="col">Cantidad</th>
          <th scope="col">Atributos</th>
          <th scope="col" [width]="'5rem'"></th>
        </tr>
      </thead>
      <tbody>
        @for (item of filteredItems(); track $index) {
          @let stockStatus = getStockStatus(item);
          <tr>
            <td><app-icon [name]="item.categoria.icono || 'Barcode'" /></td>
            <td>{{ item.id }}</td>
            <td>{{ item.nombre }}</td>
            <td>
              <span [class]="['status', 'status-' + stockStatus.status]">
                <Text tag="smallBody"
                  >Stock: {{ stockStatus.current }} | min: {{ stockStatus.min }}</Text
                >
              </span>
            </td>
            <td>
              @for (inv of item.details; track inv.id_inventario) {
                @for (attr of inv.attributes; track attr.id) {
                  <span class="status status-lite me-1">
                    <Text tag="smallBody">{{ attr.valor }}</Text>
                  </span>
                }
              }
            </td>
            <td class="d-flex gap-1">
              <button type="button" class="btn btn-sm">
                <app-icon name="Pencil" [size]="16" />
              </button>
              <button type="button" class="btn btn-sm">
                <app-icon name="Trash" [size]="16" />
              </button>
            </td>
          </tr>
        }
      </tbody>
    </table>
  `,
  imports: [IconComponent, TextComponent],
})
export class InventaryTableComponent implements OnInit {
  items = input<IInventaryItem[]>([]);
  filters = signal<{ q?: string; cty?: number; subCty?: number }>({});
  filteredItems = computed(() => {
    const currentFilters = this.filters();

    if (currentFilters.q || currentFilters.cty || currentFilters.subCty)
      return this.items().filter((item) => {
        const insideQ = currentFilters.q
          ?.toLowerCase()
          .split(',')
          .some((q) => item.forSearch.includes(q.trim() || ''));
        const insideQty = currentFilters.cty ? item.categoria.id === currentFilters.cty : true;
        const insideSubQty = currentFilters.subCty
          ? item.sub_categoria.id === currentFilters.subCty
          : true;
        return insideQ && insideQty && insideSubQty;
      });
    return this.items();
  });
  searchText: string = '';
  searchTextTimeout: number | undefined = undefined;

  constructor() {}

  ngOnInit() {}

  getStockStatus(item: IInventaryItem): { min: number; current: number; status: string } {
    let status = {
      current: 0,
      min: 0,
      diff: 0,
      status: 'lime',
    };
    item.details.forEach((inv) => {
      status.current = status.current + inv.stock;
      status.min = status.min + inv.stock_minimo;
    });
    status.diff = status.current / (status.min || 1);

    if (status.current === 0) status.status = 'red';
    if (status.diff >= 2) status.status = 'orange';
    if (status.diff >= 3) status.status = 'lime';
    return status;
  }

  setSearchText(text: string) {
    this.searchText = text;

    clearTimeout(this.searchTextTimeout);
    this.searchTextTimeout = setTimeout(() => {
      this.filters.update((item) => ({ ...item, q: text }));
    }, 700);
  }

  onSearchInput(event: Event) {
    event.preventDefault();
    const { value } = event.target as HTMLInputElement;
    this.setSearchText(value);
  }

  clearSearch(e: Event) {
    e.preventDefault();
    this.setSearchText('');
  }
}
