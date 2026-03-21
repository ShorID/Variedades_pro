import { Component, effect, OnDestroy, OnInit, signal } from '@angular/core';
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

type filtersType = 'subcategory' | 'category' | 'q';

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
  filters = signal<Record<filtersType | string, number | string | null>>({});
  filtersEffect = effect(() => {
    this.page$.next(1);
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
          tap(() => this.loading.update(() => true)),
          switchMap((page) => {
            const params: Record<string, any> = { page, limit: this.itemsPerPage };
            if (this.filters()['subcategory']) params['sCty'] = this.filters()['subcategory'];
            if (this.filters()['category']) params['cty'] = this.filters()['category'];
            if (this.filters()['q']) params['q'] = this.filters()['q'];
            return this.invHttpsService.getInventary(params).pipe(
              tap(({ data, error, count }) => {
                this.paginationStatus.update(() => ({
                  count: count || 0,
                  pages: Math.ceil((count || 0) / (this.itemsPerPage + 1)),
                }));
                if (data) {
                  const inv = this.invService.buildData(data);
                  this.invService.setItems(inv.items);
                  // this.categories.set(inv.categories);
                  // this.subcategories.set(inv.subcategories);
                }
              }),
              catchError(() => {
                this.loading.update(() => false);
                return of(null);
              }),
            );
          }),
          switchMap(() => {
            if (!this.categories().length)
              return this.invHttpsService.getInvClasification().pipe(
                tap(({ attributes, categories, subCategories }) => {
                  this.categories.set(categories);
                  this.subcategories.set(subCategories);
                }),
              );
            return of(null);
          }),
        )
        .subscribe(() => this.loading.update(() => false)),
      this.invService.items$.pipe(tap((items) => this.inventary.set(items))).subscribe(),
    );
  }

  ngOnDestroy(): void {
    this.suscriptions.forEach((e) => e.unsubscribe());
    this.filtersEffect.destroy()
  }

  refreshProducts() {
    this.page$.next(1);
  }

  redirectToCreate() {
    this.router.navigate(['create'], { relativeTo: this.route });
  }

  setFilter(key: filtersType, value: IInvCategory | IInvSubCategory | undefined) {
    this.filters.update((prev) => ({ ...prev, [key]: value ? value?.id : null }));
  }

  onChangePage(newPage: number) {
    // this.filters.update(() => ({}));
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

  handleSearch(q: string) {
    this.filters.update((prev) => ({ ...prev, q: q || null }));
  }
}
