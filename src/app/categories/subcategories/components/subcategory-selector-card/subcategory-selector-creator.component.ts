import { Component, computed, input, OnInit, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IconSelectorComponent } from '../../../../components/Icon/icon-selector.component';
import { TextComponent } from '../../../../components/Text/text.component';
import { InventaryHttpsService } from '../../../../inventary/services/inventary-https.service';
import { tap } from 'rxjs';
import { IInvSubCategory } from '../../../../inventary/interfaces/inventary.interfaces';

@Component({
  selector: 'subcategory-selector-creator',
  imports: [ReactiveFormsModule, IconSelectorComponent, TextComponent],
  template: `
    @let form = createForm();
    @if (form) {
      <div class="modal modal-blur fade show d-flex" tabindex="-1">
        <div class="modal-dialog m-auto w-100" role="document">
          <div class="modal-content">
            <form [formGroup]="form" (submit)="onSubmitForm($event)">
              <div class="modal-header">
                <h5 class="modal-title">Crear Sub Categoria</h5>
                <button type="button" class="btn-close" (click)="onClose.emit()"></button>
              </div>
              <div class="modal-body">
                <div class="mb-3">
                  <label class="form-label">Nombre</label>
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
                <div>
                  <label class="form-label">
                    <Text>Escoge un icono</Text>
                  </label>
                  <icon-selector (onChange)="form.get('icono')?.setValue($event)" />
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
export class SubcategorySelectorCreatorComponent implements OnInit {
  onClose = output();
  onSubmit = output<IInvSubCategory>();
  title = input<string>('');
  idCategory = input.required<number>();
  createForm = computed(() => {
    if (this.title()) {
      return new FormGroup({
        nombre: new FormControl(this.title(), [Validators.required, Validators.minLength(2)]),
        icono: new FormControl(''),
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
        .insertSubCategory({
          nombre: form.value.nombre || '',
          icono: form.value.icono || undefined,
          activo: true,
          id_categoria: this.idCategory(),
        })
        .pipe(
          tap((res) => {
            if (res.data?.length) this.onSubmit.emit(res.data[0]);
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
