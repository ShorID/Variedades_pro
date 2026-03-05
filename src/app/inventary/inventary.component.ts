import { Component, computed, OnDestroy, OnInit, signal } from '@angular/core';
import { TextComponent } from '../components/Text/text.component';
import { IconComponent } from '../components/Icon/icon.component';
import { CategoriesSelectorComponent } from '../categories/components/category-selector-card/category-selector-card.component';
import { InventaryHttpsService } from './services/inventary-https.service';
import { InventaryService } from './services/inventary.service';
import { BehaviorSubject, catchError, of, Subscription, switchMap, tap } from 'rxjs';
import { IInvCategory, IInventaryItem, IInvSubCategory } from './interfaces/inventary.interfaces';
import { PaginationComponent } from '../components/pagination/pagination.component';
import { InventaryTableComponent } from './components/inventary-table/inventary-table.component';
import { ActivatedRoute, Router } from '@angular/router';
import { SubcategorySelectorComponent } from '../categories/subcategories/components/subcategory-selector-card/subcategory-selector-card.component';

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
  refresh$ = new BehaviorSubject(undefined);
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

  constructor(
    private invHttpsService: InventaryHttpsService,
    private invService: InventaryService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.suscriptions.push(
      this.refresh$
        .asObservable()
        .pipe(
          switchMap(() => {
            this.loading.update(() => true);
            return this.invHttpsService.getInventary().pipe(
              tap(({ data, error }) => {
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
    this.refresh$.next(undefined);
  }

  redirectToCreate() {
    this.router.navigate(['create'], { relativeTo: this.route });
  }

  setFilter(key: string, value: IInvCategory | IInvSubCategory | undefined) {
    this.filters.update((prev) => ({ ...prev, [key]: value ? value?.id : null }));
  }
}
