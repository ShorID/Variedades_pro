import { Component, computed, OnDestroy, OnInit, signal } from '@angular/core';
import { TextComponent } from '../components/Text/text.component';
import { IconComponent } from '../components/Icon/icon.component';
import { CategoriesSelectorComponent } from '../categories/components/category-selector-card/category-selector-card.component';
import { InventaryHttpsService } from './services/inventary-https.service';
import { InventaryService } from './services/inventary.service';
import { BehaviorSubject, catchError, filter, of, Subscription, switchMap, tap } from 'rxjs';
import { IInvCategory, IInventaryItem, IInvSubCategory } from './interfaces/inventary.interfaces';
import { PaginationComponent } from '../components/pagination/pagination.component';
import { InventaryTableComponent } from './components/inventary-table/inventary-table.component';
import { ActivatedRoute, Router } from '@angular/router';
import { SubcategorySelectorComponent } from '../categories/subcategories/components/subcategory-selector-card/subcategory-selector-card.component';
import { NotifyService } from '../services/notify.service';

@Component({
  selector: 'page-inventary',
  templateUrl: './inventary.component.html',
  styleUrl: './inventary.component.scss',
  imports: [
    TextComponent,
    IconComponent,
    CategoriesSelectorComponent,
    PaginationComponent,
    InventaryTableComponent,
    SubcategorySelectorComponent,
  ],
})
export class InventaryComponent implements OnInit, OnDestroy {
  loading = signal<boolean>(true);
  inventary = signal<IInventaryItem[]>([]);
  categories = signal<IInvCategory[]>([]);
  subcategories = signal<IInvSubCategory[]>([]);
  suscriptions: Subscription[] = [];

  page$ = new BehaviorSubject<number>(1);
  filters = signal<Record<string, number | null>>({});
  filteredInventary = computed(() => {
    return this.inventary().filter((item) => {
      if (this.filters()['subcategory'] || this.filters()['cateogory'])
        return (
          (this.filters()['subcategory'] || 0) === item.sub_categoria.id ||
          (this.filters()['cateogory'] || 0) === item.sub_categoria.id_categoria
        );
      return true;
    });
  });

  readonly itemsPerPage = 9;
  paginationStatus = signal({
    pages: 0,
    count: 0,
  });

  openConfirmDelete = signal<IInventaryItem | null>(null);

  constructor(
    private invHttpsService: InventaryHttpsService,
    private invService: InventaryService,
    private router: Router,
    private route: ActivatedRoute,
    protected notify: NotifyService,
  ) {}

  ngOnInit() {
    this.suscriptions.push(
      this.page$
        .asObservable()
        .pipe(
          filter((page) => !!page),
          switchMap((page) => {
            this.loading.update(() => true);
            return this.invHttpsService.getInventary({ page, limit: this.itemsPerPage }).pipe(
              tap(({ data, error, count }) => {
                this.paginationStatus.update(() => ({
                  count: count || 0,
                  pages: Math.ceil((count || 0) / (this.itemsPerPage + 1)),
                }));
                if (data) {
                  const inv = this.invService.buildData(data);
                  this.invService.setItems(inv.items);
                  this.categories.set(inv.categories);
                  this.subcategories.set(inv.subcategories);
                }
              }),
              catchError(() => {
                this.loading.update(() => false);
                return of(null);
              }),
            );
          }),
        )
        .subscribe(() => this.loading.update(() => false)),
      this.invService.items$.pipe(tap((items) => this.inventary.set(items))).subscribe(),
    );
  }

  ngOnDestroy(): void {
    this.suscriptions.forEach((e) => e.unsubscribe());
  }

  refreshProducts() {
    this.page$.next(1);
  }

  redirectToCreate() {
    this.router.navigate(['create'], { relativeTo: this.route });
  }

  setFilter(key: string, value: IInvCategory | IInvSubCategory | undefined) {
    this.filters.update((prev) => ({ ...prev, [key]: value ? value?.id : null }));
  }

  onChangePage(newPage: number) {
    this.filters.update(() => ({}));
    this.page$.next(newPage);
  }

  deleteItem(item: IInventaryItem) {
    this.openConfirmDelete.update(() => item);
  }

  cancelDelete() {
    this.openConfirmDelete.update(() => null);
  }

  confirmDelete() {
    const itemToDelete = this.openConfirmDelete();
    if (itemToDelete)
      this.invHttpsService
        .deleteProduct(itemToDelete.id)
        .pipe(
          tap(() => {
            this.page$.next(1);
            this.openConfirmDelete.update(() => null);
            this.notify.success('Producto Eliminado!');
          }),
        )
        .subscribe();
  }
}
