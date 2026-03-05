import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { InventaryCreateComponent } from '../inventary-create/inventary-create.component';
import { InventaryHttpsService } from '../../services/inventary-https.service';
import { ActivatedRoute, Router } from '@angular/router';
import { map, Subscription, switchMap, tap } from 'rxjs';
import { InventaryService } from '../../services/inventary.service';
import { IInventaryItem } from '../../interfaces/inventary.interfaces';

@Component({
  selector: 'page-inventary-edit',
  template: `
    @if (loading()) {
      Cargando datos...
    } @else {
      <page-inventary-create [title]="'Editar Producto'" [defaultData]="productData()" />
    }
  `,
  imports: [InventaryCreateComponent],
})
export class InventaryEditComponent implements OnInit, OnDestroy {
  loading = signal<boolean>(true);
  productData = signal<IInventaryItem | undefined>(undefined);
  subscription: Subscription[] = [];

  constructor(
    private inventaryHttpService: InventaryHttpsService,
    private invService: InventaryService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit() {
    this.loading.set(true);
    this.subscription.push(
      this.route.paramMap
        .pipe(
          switchMap((params) => {
            const productId = params.get('id') ? params.get('id') || 0 : 0;
            return this.inventaryHttpService.getInventaryById(+productId).pipe(
              tap(({ data }) => {
                if (data?.length) {
                  const inv = this.invService.buildData(data);
                  this.productData.set(inv.items[0]);
                } else {
                  this.router.navigateByUrl('404');
                }
                this.loading.update(() => false);
              }),
            );
          }),
        )
        .subscribe(),
    );
  }

  ngOnDestroy(): void {
    this.subscription.forEach((i) => i.unsubscribe());
  }
}
