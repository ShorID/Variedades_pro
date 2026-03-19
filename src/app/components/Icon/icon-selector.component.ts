import { Component, effect, input, OnDestroy, OnInit, output } from '@angular/core';
import { lucidIconsObj, IconComponent } from './icon.component';

@Component({
  selector: 'icon-selector',
  styles: `
    :host {
      display: flex;
      flex-wrap: wrap;
      gap: 0.7rem;
      justify-content: space-between;

      button:last-of-type {
        margin-right: auto;
      }
    }
  `,
  template: `
    @for (icon of availableIcons; track $index) {
      <button
        [class]="['btn', 'btn-sm', 'btn-icon', 'p-1', icon === selectedItem ? 'active' : '']"
        (click)="selectIcon(icon)"
        type="button"
      >
        <app-icon [name]="icon" />
      </button>
    }
  `,
  imports: [IconComponent],
})
export class IconSelectorComponent implements OnInit, OnDestroy {
  availableIcons = Object.keys(lucidIconsObj);
  selectedItem: string = '';
  onChange = output<string>();
  value = input<string>();

  valueEffect = effect(() => {
    const value = this.value();
    if (value && this.availableIcons.some((i) => i === value)) this.selectedItem = value;
  });

  constructor() {}

  ngOnInit() {}

  ngOnDestroy(): void {
    this.valueEffect.destroy();
  }

  selectIcon(icon: string) {
    this.selectedItem = icon;
    this.onChange.emit(icon);
  }
}
