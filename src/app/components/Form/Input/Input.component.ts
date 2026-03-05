import { Component, effect, input, OnDestroy, OnInit, output } from '@angular/core';
import { TextComponent } from '../../Text/text.component';

@Component({
  selector: 'app-input',
  styleUrl: './Input.component.scss',
  template: `
    @if (label()) {
      <Text [tagClass]="labelClass">
        {{ label() }}
        @if (required()) {
          <span class="text-danger">*</span>
        }
      </Text>
    }

    @switch (iType()) {
      @case ('textarea') {
        <textarea
          [class]="inputClass"
          [name]="name()"
          [placeholder]="placeholder()"
          (input)="onInputChange($event)"
          [value]="inputValue"
          autocomplete="off"
          [rows]="lines()"
          [readOnly]="disabled()"
          [disabled]="disabled()"
        ></textarea>
      }
      @default {
        <input
          [type]="iType()"
          [class]="inputClass"
          [name]="name()"
          [placeholder]="placeholder()"
          (input)="onInputChange($event)"
          [value]="inputValue"
          [required]="required()"
          [readOnly]="disabled()"
          autocomplete="off"
          [disabled]="disabled()"
          [step]="step()"
        />
      }
    }
    <ng-content></ng-content>
  `,
  imports: [TextComponent],
})
export class InputComponent implements OnInit, OnDestroy {
  label = input<string>('');
  name = input<string>('');
  value = input<string | undefined>(undefined);
  placeholder = input<string>('');
  onChange = output<Event>();;
  required = input<boolean>(false);
  disabled = input<boolean>(false);
  step = input<string>('1');

  iClass = input<string>('');
  get inputClass() {
    let classnames: string[] = ['form-control'];
    classnames = classnames.concat(this.iClass().split(' '));
    return classnames;
  }
  lClass = input<string>('');
  get labelClass() {
    let classnames: string[] = ['form-label'];
    classnames = classnames.concat(this.lClass().split(' '));
    return classnames.join(' ');
  }
  iType = input<'text' | 'password' | 'number' | 'textarea'>();

  inputValue: string = '';
  valueEffect = effect(() => {
    this.inputValue = this.value() || '';
  });

  lines = input<number>(4);

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
