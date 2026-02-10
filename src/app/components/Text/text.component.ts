import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'Text',
  styleUrl: './text.component.scss',
  template: ` <span [class]="classes"><ng-content></ng-content></span> `,
})
export class TextComponent {
  tag = input<tagsType>('bigBody');
  bold = input<boldType>('regular');
  italic = input<boolean>(false);
  tagClass = input<string>('');
  tagClassT = computed(() => this.tagClass().split(' '));

  get classes() {
    return [
      `Text-${this.tag()}`,
      `Text-w-${this.bold()}`,
      this.italic() ? 'Text-italic' : '',
      this.tagClassT(),
    ].flat();
  }
}

type tagsType = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'bigBody' | 'smallBody';
type boldType =
  | 'thin'
  | 'lighter'
  | 'light'
  | 'regular'
  | 'medium'
  | 'semiBold'
  | 'bold'
  | 'bolder'
  | 'black';
