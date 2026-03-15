import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { InventaryCreateComponent } from '../inventary-create/inventary-create.component';
import { InventaryHttpsService } from '../../services/inventary-https.service';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, ObservableInput, of, Subscription, switchMap, tap } from 'rxjs';
import { InventaryService } from '../../services/inventary.service';
import { IInvAttrItem, IInventaryItem, IInvPack } from '../../interfaces/inventary.interfaces';
import {
  IInsertInvProduct,
  IInsertInvStock,
  ISaveDataInventaryCreate,
} from '../../interfaces/inventary-post.interface';
import { isSameObj } from '../../../utils/commons';
import { NotifyService } from '../../../services/notify.service';

@Component({
  selector: 'page-inventary-edit',
  template: `
    @if (loading()) {
      Cargando datos...
    } @else {
      <page-inventary-create
        [title]="'Editar Producto'"
        [defaultData]="productData()"
        [rewriteSave]="true"
        (onSave)="onSave($event)"
      />
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
    private notify: NotifyService,
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

  onSave(saveData: ISaveDataInventaryCreate) {
    const baseData = this.productData();
    if (baseData) {
      let productChanges: Partial<IInsertInvProduct> = {};
      let invChanges: Partial<IInsertInvStock> = {};
      let packsChange: { toUpdate: Partial<IInvPack>[]; toCreate: IInvPack[] } = {
        toCreate: [],
        toUpdate: [],
      };
      let attributesChange: {
        toAssociate: IInvAttrItem[];
        toDissociate: IInvAttrItem[];
      } = {
        toAssociate: [],
        toDissociate: [],
      };
      Object.entries(saveData).forEach(([key, value]) => {
        switch (key) {
          case 'id_sub_categoria':
          case 'id_marca':
          case 'costo':
          case 'codigo':
          case 'descripcion':
            productChanges[key] = value;
            break;
          case 'stock':
          case 'stock_minimo':
            invChanges[key] = value;
            break;
          /** CASE PACKS */
          case 'packs':
            baseData[key]
              .filter((pack) => !saveData[key].some((item) => item.id === pack.id))
              .forEach((item) => packsChange.toUpdate.push({ id: item.id, activo: false }));
            saveData[key].forEach((pack) => {
              const bkPack = baseData.packs.find((item) => item.id === pack.id);
              if (bkPack) {
                const { changes, isTheSame } = isSameObj(bkPack, pack);
                if (!isTheSame && changes) {
                  let updatedPack: Partial<IInvPack> = {
                    id: bkPack.id,
                  };
                  (Object.keys(changes) as (keyof IInvPack)[]).forEach((key) => {
                    updatedPack[key] = changes[key]?.newValue;
                  });
                  packsChange.toUpdate.push(updatedPack);
                }
              } else packsChange.toCreate.push(pack);
            });
            break;
          /** CASE ATTRIBUTES */
          case 'attributes':
            baseData[key]
              .filter((pack) => !saveData[key].some((item) => item.id === pack.id))
              .forEach((item) => attributesChange.toDissociate.push({ ...item, activo: false }));
            saveData[key].forEach((attr) => {
              const bk = baseData.attributes.find((item) => item.id === attr.id);
              if (!bk) attributesChange.toAssociate.push(attr);
            });
            break;
          default:
            break;
        }
      });
      forkJoin([
        this.inventaryHttpService.updateProduct(baseData.id, productChanges),
        this.inventaryHttpService.updateProductInv(baseData.inventary[0].id, invChanges),
      ])
        .pipe(
          switchMap(() => {
            const packReq: ObservableInput<any>[] = [];
            if (packsChange.toCreate.length)
              packReq.push(
                this.inventaryHttpService.insertProductPack(baseData.id, packsChange.toCreate),
              );
            packsChange.toUpdate.forEach((item) =>
              packReq.push(this.inventaryHttpService.updateProductPack(baseData.id, item)),
            );
            if (packReq.length) return forkJoin(packReq);
            return of(null);
          }),
          switchMap(() => {
            const attrReq: ObservableInput<any>[] = [];
            if (attributesChange.toAssociate.length)
              attrReq.push(
                this.inventaryHttpService.insertProductAttr(
                  baseData.id,
                  attributesChange.toAssociate,
                ),
              );
            attributesChange.toDissociate.forEach((item) =>
              attrReq.push(
                this.inventaryHttpService.updateProductAttr(baseData.id, item.id, false),
              ),
            );
            if (attrReq.length) return forkJoin(attrReq);
            return of(null);
          }),
        )
        .subscribe({
          next: () => {
            this.notify.success('Articulo Creado correctamente!');
            this.router.navigateByUrl('inventary');
          },
          error: (err) => {
            this.notify.error('Ocurrio un error al crear el producto');
          },
        });
    }
  }
}
