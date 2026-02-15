import { Component, effect, input, OnDestroy, OnInit, output } from '@angular/core';
import { TextComponent } from '../../Text/text.component';

@Component({
  selector: 'app-input',
  styleUrl: './Input.component.scss',
  template: `
    @if (label()) {
      <Text [tagClass]="['form-label', lClass()].join(' ')">{{ label() }}</Text>
    }
    <input
      [type]="iType()"
      [class]="['form-control', iClass()]"
      [name]="name()"
      [placeholder]="placeholder()"
      (input)="onInputChange($event)"
      [value]="inputValue"
      autocomplete="off"
    />
    <ng-content></ng-content>
  `,
  imports: [TextComponent],
})
export class InputComponent implements OnInit, OnDestroy {
  label = input<string>('');
  name = input<string>('');
  value = input<string | undefined>(undefined);
  placeholder = input<string>('');
  onChange = output<Event>();

  iClass = input<string>('');
  lClass = input<string>('');
  iType = input<'text' | 'password' | 'number'>();

  inputValue: string = '';
  valueEffect = effect(() => {
    this.inputValue = this.value() || '';
  });

  constructor() {}

  ngOnInit() {}

  ngOnDestroy(): void {
    this.valueEffect.destroy();
  }

  onInputChange(e: Event) {
    const { value } = e.target as HTMLInputElement;
    if (typeof this.value() !== 'string') this.inputValue = value;

    this.onChange.emit(e);
  }
}
