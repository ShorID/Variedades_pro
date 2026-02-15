import { Component, computed, effect, input, OnInit, output, signal } from '@angular/core';
import { IconComponent } from '../Icon/icon.component';
import { TextComponent } from '../Text/text.component';

export interface ICardSelectItem {
  value: string;
  icon?: string;
  label: string;
  qty?: number;
}

@Component({
  selector: 'app-card-select',
  styleUrl: './card-select.component.scss',
  template: `
    <div class="Card-selector card">
      <div class="card-header">
        <Text bold="bold" [tagClass]="'d-flex align-items-center'">
          @if (icon()) {
            <app-icon [name]="icon()" class="d-block-inline me-1" />
          }
          {{ title() }}
        </Text>
      </div>
      <div class="card-body p-0">
        @for (item of items(); track $index) {
          @let selected = item.value === selectedItem?.value;
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
  `,
  imports: [IconComponent, TextComponent],
})
export class CardSelectComponent implements OnInit {
  items = input<ICardSelectItem[]>([]);
  total = computed(() => {
    let sum = 0;
    this.items().forEach((item) => {
      sum = (item.qty || 0) + sum;
    });
    return sum;
  });
  title = input<string>();
  icon = input<string>('Shapes');
  onSelect = output<ICardSelectItem>();
  errorMsg = input<string>('');

  selectedItem: ICardSelectItem | null = null;

  value = input<string>();
  valueEffect = effect(() => {
    const slctItem = this.items().find((i) => i.value === this.value());
    this.selectedItem = slctItem || null;
  });

  constructor() {}

  ngOnInit() {}

  selectItem(item: ICardSelectItem) {
    this.selectedItem = item;
    this.onSelect.emit(item);
  }
}
