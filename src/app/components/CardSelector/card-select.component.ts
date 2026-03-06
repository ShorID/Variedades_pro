import { Component, computed, effect, input, OnInit, output, signal } from '@angular/core';
import { IconComponent } from '../Icon/icon.component';
import { TextComponent } from '../Text/text.component';
import { NgClickOutsideDirective } from 'ng-click-outside2';
import { InputComponent } from '../Form/Input/Input.component';

export interface ICardSelectItem {
  value: string;
  icon?: string;
  label: string;
  qty?: number;
  isDivider?: boolean;
}

@Component({
  selector: 'app-card-select',
  styleUrl: './card-select.component.scss',
  template: `
    <div
      [class]="['Card-selector', 'card', 'Card-selector-mode-' + mode(), isOpen() ? 'isOpen' : '']"
      (clickOutside)="handleOpen(false)"
      (click)="handleOpen(true)"
    >
      <div class="card-header p-1">
        <Text bold="bold" [tagClass]="'d-flex align-items-center'">
          @if (icon()) {
            <app-icon [name]="icon()" class="d-block-inline me-1" />
          }
          {{ title() }}
          @if (selectedItemQty) {
            <span class="badge bg-red text-red-fg badge-notification">{{ selectedItemQty }}</span>
          }
        </Text>
      </div>
      <div class="Card-selector-content">
        <div class="card-header d-block p-1">
          <div class="row g-2">
            <div class="col">
              <app-input
                placeholder="Buscar..."
                iClass="form-control-sm"
                class="w-100"
                [value]="searchText()"
                (onChange)="handleSearchText($event)"
              />
            </div>
            @if (canCreate()) {
              <div class="col-auto">
                <button type="button" class="btn btn-sm btn-success">
                  Crear <app-icon name="plus" [size]="18" />
                </button>
              </div>
            }
          </div>
        </div>
        <div class="card-body p-0">
          @for (item of filteredItems(); track $index) {
            @if (item.isDivider) {
              <div class="hr-text hr-text-center my-3">
                {{ item.label }}
              </div>
            } @else {
              @let selected = item.value === selectedItem[item.value]?.value;
              <button
                type="button"
                [class]="['btn', 'Card-selector-item', selected && 'active']"
                (click)="selectItem(item)"
              >
                <div class="row">
                  @if (item.icon) {
                    <app-icon [name]="item.icon" class="col-auto" />
                  }
                  <div class="col">
                    <Text [bold]="selected ? 'bold' : 'regular'">{{ item.label }} </Text>
                    @if ('qty' in item) {
                      <span class="status status-lite ms-auto"> {{ item.qty }} </span>
                    }
                  </div>
                </div>
              </button>
            }
          }
          @if (errorMsg()) {
            <div class="Card-selector-error">
              {{ errorMsg() }}
            </div>
          }
        </div>
        @if (total()) {
          <div class="card-footer">
            <Text
              >Total: <span class="status status-lite ms-auto"> {{ total() }} </span></Text
            >
          </div>
        }
      </div>
    </div>
  `,
  imports: [IconComponent, TextComponent, NgClickOutsideDirective, InputComponent],
})
export class CardSelectComponent implements OnInit {
  canUnselect = input<boolean>(false);
  multiSelect = input<boolean>(false);
  items = input<ICardSelectItem[]>([]);
  filteredItems = computed<ICardSelectItem[]>(() => {
    if (this.searchText().length)
      return this.items().filter((item) => {
        if (item.isDivider) return true;
        return item.label.toLowerCase().includes(this.searchText().toLowerCase());
      });
    return this.items();
  });
  total = computed(() => {
    let sum = 0;
    this.items().forEach((item) => {
      sum = (item.qty || 0) + sum;
    });
    return sum;
  });
  title = input<string>();
  icon = input<string>('Shapes');
  onSelect = output<ICardSelectItem | null>();
  onMultiSelect = output<ICardSelectItem[]>();
  errorMsg = input<string>('');

  selectedItem: Record<string, ICardSelectItem> = {};
  selectedItemQty: number = 0;

  value = input<string | string[]>();
  valueEffect = effect(() => {
    const value = this.value() ? [this.value()].flat() : [];
    this.selectedItem = {};
    this.selectedItemQty = 0
    this.items().forEach((i) => {
      if (value.some((j) => j === i.value)) {
        this.selectedItem[i.value] = i;
        if(!i.isDivider) this.selectedItemQty += 1;
      }
    });
  });

  mode = input<'card' | 'select'>('card');
  isOpen = signal<boolean>(false);

  searchText = signal<string>('');
  canCreate = input<boolean>(false);

  constructor() {}

  ngOnInit() {}

  selectItem(item: ICardSelectItem) {
    if ((this.canUnselect() || this.multiSelect()) && item.value in this.selectedItem) {
      delete this.selectedItem[item.value];
    } else {
      if (!this.multiSelect()) this.selectedItem = {};
      this.selectedItem[item.value] = item;
    }
    const newValue = Object.values(this.selectedItem);
    
    console.log(newValue)
    this.selectedItemQty = newValue.length;

    if (this.multiSelect()) this.onMultiSelect.emit(newValue);
    else this.onSelect.emit(!!newValue?.length ? newValue[0] : null);
  }

  handleOpen(to: boolean) {
    if (this.mode() === 'select') this.isOpen.update(() => to);
  }

  handleSearchText(e: Event) {
    const { value } = e.target as HTMLInputElement;
    this.searchText.update(() => value);
  }
}
