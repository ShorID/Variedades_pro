import { Component, input, OnInit, output } from '@angular/core';

@Component({
  selector: 'app-input',
  styleUrl: './Input.component.scss',
  template: `
    @if (label()) {
      <label [class]="['form-label', lClass()]">
        {{ label() }}
      </label>
    }
    <input
      [type]="iType()"
      [class]="['form-control', iClass()]"
      [name]="name()"
      [placeholder]="placeholder()"
      (input)="onChange.emit($event)"
    >
  `,
})
export class InputComponent implements OnInit {
  label = input<string>('');
  name = input<string>('');
  value = input<string>('')
  placeholder = input<string>('');
  onChange = output<Event>()

  iClass = input<string>('');
  lClass = input<string>('');
  iType = input<'text' | 'password'>();

  constructor() {}

  ngOnInit() {}
}
