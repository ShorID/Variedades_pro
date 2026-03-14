import { Component, computed, input, OnInit, output, signal } from '@angular/core'

@Component({
  selector: 'app-pagination',
  template: `
    <ul class="pagination">
      <li [class]="['page-item','me-2', page() === 1 ? 'disabled' : '']">
        <a
          class="page-link page-text"
          href="#"
          role="button"
          (click)="navigateTo($event, -1)"
        >
          <i class="ti ti-chevrons-left"></i>
          Previous
        </a>
      </li>
      @for (p of pages(); track $index) {
        @let isInTheFirstPart = page() < pagesToRender() && p.value <= pagesToRender() + 1;
        @let isInTheLastPart =
          page() > totalPages() - pagesToRender() + 1 && p.value >= totalPages() - pagesToRender();
        @let isFirstLastOrSelectedItem =
          p.value === 1 ||
          p.value === totalPages() ||
          page() === p.value ||
          totalPages() < this.pagesToRender() + 2;
        @if (
          isFirstLastOrSelectedItem ||
          (p.value <= page() + 2 && p.value >= page() - 2) ||
          isInTheFirstPart ||
          isInTheLastPart
        ) {
          <li [class]="['page-item', p.value === page() ? 'active' : '']">
            <a
              [class]="['page-link']"
              href="#"
              role="button"
              (click)="changePage(p.value, $event)"
            >
              @if (isFirstLastOrSelectedItem) {
                {{ p.label }}
              } @else {
                @if (isInTheFirstPart || isInTheLastPart) {
                  {{
                    (p.value === pagesToRender() + 1 && isInTheFirstPart) ||
                    (p.value === totalPages() - pagesToRender() && isInTheLastPart)
                      ? '...'
                      : p.label
                  }}
                } @else {
                  {{ p.value === page() + 2 || p.value === page() - 2 ? '...' : p.label }}
                }
              }
            </a>
          </li>
        }
      }
      <li [class]="['page-item','ms-2', page() === totalPages() ? 'disabled' : '']">
        <a
          class="page-link page-text"
          href="#"
          role="button"
          (click)="navigateTo($event)"
        >
          Next
          <i class="ti ti-chevrons-right"></i>
        </a>
      </li>
    </ul>
  `,
})
export class PaginationComponent implements OnInit {
  onChange = output<number>()
  totalPages = input.required<number>()
  page = input.required<number>()

  pagesToRender = input<number>(5)

  pages = computed<{ value: number; label: string }[]>(() => {
    const totalPages = this.totalPages()
    return Array.from({ length: totalPages }, (_, i) => {
      return {
        value: i + 1,
        label: String(i + 1),
      }
    })
  })

  constructor() {}

  ngOnInit() {}

  navigateTo(e: Event, dir: number = 1) {
    e.preventDefault()
    if (this.page() + dir > 0 && this.page() + dir <= this.totalPages()) this.changePage(this.page() + dir)
  }

  changePage(newPage: number, e?: Event) {
    if (e) e.preventDefault()
    this.onChange.emit(newPage)
  }
}