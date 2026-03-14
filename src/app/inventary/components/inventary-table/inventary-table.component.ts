import { Component, computed, input, OnInit, output, signal } from '@angular/core';
import { IInventaryItem } from '../../interfaces/inventary.interfaces';
import { IconComponent } from '../../../components/Icon/icon.component';
import { TextComponent } from '../../../components/Text/text.component';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'inventary-table',
  template: `
    <div class="card-header">
      <div class="row g-2">
        <div class="col">
          <div class="input-group input-group-flat">
            <input
              type="text"
              class="form-control form-control-sm"
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
        <div class="col-12 col-md-auto">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
    <div class="d-none d-lg-block">
      <table class="table">
        <thead class="sticky-top">
          <tr>
            <th scope="col" [width]="'2rem'"></th>
            <th scope="col" [width]="'2rem'">ID</th>
            <th scope="col">Sub categoria</th>
            <th scope="col">Cantidad</th>
            <th scope="col">Atributos</th>
            <th scope="col">Marca</th>
            <th scope="col" [width]="'5rem'"></th>
          </tr>
        </thead>
        <tbody>
          @for (item of filteredItems(); track item.id + '-desktop') {
            @let stockStatus = getStockStatus(item);
            <tr>
              <td><app-icon [name]="item.categoria.icono || 'Barcode'" /></td>
              <td>{{ item.id }}</td>
              <td>{{ item.sub_categoria.nombre }}</td>
              <td>
                <span [class]="['status', 'status-' + stockStatus.status]">
                  <Text tag="smallBody"
                    >Stock: {{ stockStatus.current }} | min: {{ stockStatus.min }}</Text
                  >
                </span>
              </td>
              <td>
                @for (attr of item.attributes; track attr.id + '-' + $index) {
                  <span class="status status-lite me-1">
                    <Text tag="smallBody">{{ attr.valor }}</Text>
                  </span>
                }
              </td>
              <td>
                {{ item.marca.nombre }}
              </td>
              <td>
                <div class="d-flex gap-1">
                  <button type="button" class="btn btn-sm" (click)="redirectToProduct(item)">
                    <app-icon name="Pencil" [size]="16" />
                  </button>
                  <button type="button" class="btn btn-sm" (click)="onDeleteItem(item)">
                    <app-icon name="Trash" [size]="16" />
                  </button>
                </div>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
    <div class="d-block d-lg-none">
      <table class="table">
        <thead class="sticky-top">
          <tr>
            <th scope="col">Lista</th>
          </tr>
        </thead>
        <tbody>
          @for (item of filteredItems(); track item.id + '-mobile') {
            @let stockStatus = getStockStatus(item);
            <tr>
              <td>
                <div class="card p-1">
                  <div class="card-header p-1">
                    <Text tagClass="d-flex">
                      <app-icon [name]="item.categoria.icono || 'Barcode'" class="me-2" />
                      Subcategoria: {{ item.sub_categoria.nombre }}
                    </Text>
                  </div>
                  ID: {{ item.id }}<br />
                  Subcategoria: {{ item.sub_categoria.nombre }}<br />
                  <div>
                    <span [class]="['status', 'status-' + stockStatus.status]">
                      <Text tag="smallBody"
                        >Stock: {{ stockStatus.current }} | min: {{ stockStatus.min }}</Text
                      >
                    </span>
                  </div>
                  Attributos:
                  <div class="ps-1">
                    @for (attr of item.attributes; track attr.id + '-' + $index) {
                      <span class="status status-lite me-1">
                        <Text tag="smallBody">{{ attr.valor }}</Text>
                      </span>
                    }
                  </div>
                  Marca: {{ item.marca.nombre }}

                  <div class="card-footer p-1 d-flex gap-1">
                    <button type="button" class="btn btn-sm" (click)="redirectToProduct(item)">
                      <app-icon name="Pencil" [size]="16" />
                    </button>
                    <button type="button" class="btn btn-sm" (click)="onDeleteItem(item)">
                      <app-icon name="Trash" [size]="16" />
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  imports: [IconComponent, TextComponent],
})
export class InventaryTableComponent implements OnInit {
  onDelete = output<IInventaryItem>();
  items = input<IInventaryItem[]>([]);
  filters = signal<{ q?: string; cty?: number; subCty?: number }>({});
  filteredItems = computed<IInventaryItem[]>(() => {
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

  constructor(
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {}

  getStockStatus(item: IInventaryItem): { min: number; current: number; status: string } {
    let status = {
      current: 0,
      min: 0,
      diff: 0,
      status: 'lime',
    };
    item.inventary.forEach((inv) => {
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

  redirectToProduct(product: IInventaryItem) {
    this.router.navigate(['product', product.id], { relativeTo: this.route });
  }

  onDeleteItem(product: IInventaryItem) {
    this.onDelete.emit(product);
  }
}
