import { Component, computed, input, OnInit, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TextComponent } from '../../../components/Text/text.component';
import { IInvAttr, IInvAttrItem } from '../../../inventary/interfaces/inventary.interfaces';
import { InventaryHttpsService } from '../../../inventary/services/inventary-https.service';
import { of, switchMap, tap } from 'rxjs';

@Component({
  selector: 'attributes-selector-creator',
  imports: [ReactiveFormsModule, TextComponent],
  template: `
    @let form = createForm();
    @if (form) {
      <div class="modal modal-blur fade show d-flex" tabindex="-1">
        <div class="modal-dialog m-auto w-100" role="document">
          <div class="modal-content">
            <form [formGroup]="form" (submit)="onSubmitForm($event)">
              <div class="modal-header">
                <h5 class="modal-title">Crear Atributo</h5>
                <button type="button" class="btn-close" (click)="onClose.emit()"></button>
              </div>
              <div class="modal-body">
                <div class="mb-3">
                  <label class="form-label"><Text>Nombre</Text></label>
                  <input
                    type="text"
                    [class]="[
                      'form-control',
                      form.get('nombre')?.hasError('required') ? 'is-invalid' : '',
                    ]"
                    autocomplete="none"
                    placeholder="Nombre"
                    formControlName="nombre"
                  />
                  @if (form.get('nombre')?.hasError('required')) {
                    <div class="invalid-feedback">Escoge un nombre para la sub categoria</div>
                  }
                </div>
                <div class="mb-3">
                  <div class="form-label">
                    <Text>Selecciona el tipo de atributo</Text>
                  </div>
                  <select class="form-select" formControlName="id_atributo">
                    @for (attr of attributes(); track $index) {
                      <option [value]="attr.id">
                        <Text>{{ attr.nombre }}</Text>
                      </option>
                    }
                  </select>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn me-auto" (click)="onClose.emit()">Cancelar</button>
                <button type="submit" class="btn btn-primary" [disabled]="loading() || !form.valid">
                  Guardar
                  @if (loading()) {
                    <div class="spinner-border spinner-border-sm ms-1" role="status"></div>
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    }
  `,
})
export class AttributesSelectorCreatorComponent implements OnInit {
  onClose = output();
  onSubmit = output<IInvAttrItem>();
  title = input<string>('');
  idSubCategory = input.required<number>();
  attributes = input.required<IInvAttr[]>();
  createForm = computed(() => {
    if (this.title()) {
      return new FormGroup({
        nombre: new FormControl(this.title(), [Validators.required, Validators.minLength(2)]),
        id_atributo: new FormControl('', [Validators.required]),
      });
    }
    return null;
  });
  loading = signal<boolean>(false);

  constructor(private invHttp: InventaryHttpsService) {}

  ngOnInit() {}

  onSubmitForm(e: Event) {
    e.preventDefault();
    const form = this.createForm();
    if (form && form.valid) {
      this.loading.update(() => true);
      this.invHttp
        .insertAttrItem({
          valor: form.value.nombre || '',
          id_atributo: form.value.id_atributo ? +form.value.id_atributo : 0,
        })
        .pipe(
          switchMap((res) => {
            if (res.data?.length)
              return this.invHttp
                .insertAttrItemSubCty({
                  id_atr_val: res.data[0].id,
                  id_sub_categoria: this.idSubCategory(),
                })
                .pipe(
                  tap((r) => {
                    if (r.data) this.onSubmit.emit(res.data[0]);
                  }),
                );
            return of(null);
          }),
        )
        .subscribe({
          complete: () => {
            this.loading.update(() => false);
          },
        });
    }
  }
}
