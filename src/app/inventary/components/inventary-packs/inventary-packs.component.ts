import { Component, OnInit, output, signal } from '@angular/core';
import { InputComponent } from '../../../components/Form/Input/Input.component';
import { TextComponent } from '../../../components/Text/text.component';
import { IconComponent } from '../../../components/Icon/icon.component';
import { IInvPack } from '../../interfaces/inventary.interfaces';

@Component({
  selector: 'app-inventary-packs',
  styles: `
    tr.is-invalid ::ng-deep app-input .form-control {
      border-color: red;
    }
  `,
  template: `
    <!-- Mobile -->
    <div class="d-block d-md-none">
      <table class="table">
        <thead class="sticky-top">
          <tr>
            <th scope="col">Paquetes</th>
          </tr>
        </thead>
        <tbody>
          @for (pack of currentPacks(); track $index) {
            @let isValid =
              !!pack['nombre'] &&
              !!pack['abreviatura'] &&
              !!pack['unidades_empaques'] &&
              !!pack['precio_venta'];
            @let lineClass =
              showValidations() && pack['required'] ? (isValid ? 'is-valid' : 'is-invalid') : '';
            <tr [class]="[lineClass]">
              <td>
                <div class="card p-1">
                  <app-input
                    name="nombre"
                    iClass="form-control-sm"
                    (onChange)="onInputChange($index, $event)"
                    [value]="pack['nombre']"
                    [required]="!!pack.required"
                    [disabled]="!!pack.default"
                    label="Nombre"
                    class="mb-2"
                  />
                  <app-input
                    name="abreviatura"
                    iClass="form-control-sm"
                    (onChange)="onInputChange($index, $event)"
                    [value]="pack['abreviatura']"
                    [required]="!!pack.required"
                    [disabled]="!!pack.default"
                    label="Abreviatura"
                    class="mb-2"
                  />
                  <div class="row">
                    <div class="col-6">
                      <app-input
                        name="unidades_empaques"
                        iType="number"
                        step="0.01"
                        iClass="form-control-sm"
                        [value]="pack['unidades_empaques'] + ''"
                        (onChange)="onInputChange($index, $event)"
                        [required]="!!pack.required"
                        label="Unidades"
                        class="mb-2"
                      />
                    </div>
                    <div class="col-6">
                      <app-input
                        name="precio_venta"
                        iType="number"
                        step="0.01"
                        iClass="form-control-sm"
                        [value]="pack['precio_venta'] + ''"
                        (onChange)="onInputChange($index, $event)"
                        [required]="!!pack.required"
                        label="Precio de venta"
                        class="mb-2"
                      />
                    </div>
                  </div>
                  <app-input
                    name="codigo"
                    (onChange)="onInputChange($index, $event)"
                    iClass="form-control-sm"
                    [value]="pack['codigo']"
                    label="Codigo"
                    class="mb-2"
                  />
                  <button
                    type="button"
                    class="btn btn-sm p-1 btn-icon btn-outline-danger"
                    (click)="deleteRow($index)"
                    [disabled]="!!pack.default"
                  >
                    <app-icon name="Trash" [size]="16" />
                  </button>
                </div>
              </td>
            </tr>
          }
          <tr>
            <td colspan="2">
              <button class="btn btn-sm w-100" type="button" (click)="addMore()">
                <Text tagClass="d-flex align-items-center">
                  <app-icon name="plus" />
                  Agregar mas
                </Text>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- Desktop -->
    <table class="table d-none d-md-block">
      <thead class="sticky-top">
        <tr>
          <th scope="col">Nombre</th>
          <th scope="col">Abreviatura</th>
          <th scope="col">Unidades</th>
          <th scope="col">Precio</th>
          <th scope="col">Codigo</th>
          <th scope="col"></th>
        </tr>
      </thead>
      <tbody>
        @for (pack of currentPacks(); track $index) {
          @let isValid =
            !!pack['nombre'] &&
            !!pack['abreviatura'] &&
            !!pack['unidades_empaques'] &&
            !!pack['precio_venta'];
          @let lineClass =
            showValidations() && pack['required'] ? (isValid ? 'is-valid' : 'is-invalid') : '';
          <tr [class]="[lineClass]">
            <td>
              <app-input
                name="nombre"
                iClass="form-control-sm"
                (onChange)="onInputChange($index, $event)"
                [value]="pack['nombre']"
                [required]="!!pack.required"
                [disabled]="!!pack.default"
              />
            </td>
            <td>
              <app-input
                name="abreviatura"
                iClass="form-control-sm"
                (onChange)="onInputChange($index, $event)"
                [value]="pack['abreviatura']"
                [required]="!!pack.required"
                [disabled]="!!pack.default"
              />
            </td>
            <td>
              <app-input
                name="unidades_empaques"
                iType="number"
                step="0.01"
                iClass="form-control-sm"
                [value]="pack['unidades_empaques'] + ''"
                (onChange)="onInputChange($index, $event)"
                [required]="!!pack.required"
              />
            </td>
            <td>
              <app-input
                name="precio_venta"
                iType="number"
                step="0.01"
                iClass="form-control-sm"
                [value]="pack['precio_venta'] + ''"
                (onChange)="onInputChange($index, $event)"
                [required]="!!pack.required"
              />
            </td>
            <td>
              <app-input
                name="codigo"
                (onChange)="onInputChange($index, $event)"
                iClass="form-control-sm"
                [value]="pack['codigo']"
              />
            </td>
            <td>
              <button
                type="button"
                class="btn btn-sm p-1 btn-icon btn-outline-danger"
                (click)="deleteRow($index)"
                [disabled]="!!pack.default"
              >
                <app-icon name="Trash" [size]="16" />
              </button>
            </td>
          </tr>
        }
        <tr>
          <td colspan="6">
            <button class="btn btn-sm w-100" type="button" (click)="addMore()">
              <Text tagClass="d-flex align-items-center">
                <app-icon name="plus" />
                Agregar mas
              </Text>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  `,
  imports: [InputComponent, TextComponent, IconComponent],
})
export class InventaryPacksComponent implements OnInit {
  onChange = output<IInvPack[]>();
  currentPacks = signal<IInvPack[]>([
    {
      abreviatura: 'UND',
      nombre: 'Unidad',
      codigo: '',
      precio_venta: 0,
      unidades_empaques: 0,
      default: true,
      required: true,
    },
    {
      abreviatura: 'CJ',
      nombre: 'Caja',
      codigo: '',
      precio_venta: 0,
      unidades_empaques: 0,
      default: true,
    },
  ]);
  showValidations = signal<boolean>(false);

  constructor() {}

  ngOnInit() {}

  addMore() {
    this.currentPacks.update((prev) => [
      ...prev,
      {
        abreviatura: '',
        nombre: '',
        codigo: '',
        precio_venta: 0,
        unidades_empaques: 0,
        required: true,
      },
    ]);
    this.showValidations.update(() => true);
    this.updateValue();
  }

  onInputChange(idx: number, e: Event) {
    const { value, name } = e.target as HTMLInputElement;
    this.currentPacks.update((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [name]: value } : item)),
    );
    this.updateValue();
  }

  deleteRow(idx: number) {
    this.currentPacks.update((prev) => prev.filter((__, i) => (i === idx ? false : true)));
    this.updateValue();
  }

  updateValue() {
    this.onChange.emit(this.currentPacks());
  }
}
