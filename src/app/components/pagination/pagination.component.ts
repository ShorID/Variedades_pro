import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-pagination',
  template: `
    <ul class="pagination">
      <li class="page-item disabled">
        <a class="page-link" href="#" tabindex="-1" aria-disabled="true">
          <!-- Download SVG icon from http://tabler.io/icons/icon/chevron-left -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="icon icon-1"
          >
            <path d="M15 6l-6 6l6 6" />
          </svg>
        </a>
      </li>
      <li class="page-item">
        <a class="page-link" href="#">1</a>
      </li>
      <li class="page-item">
        <a class="page-link" href="#">2</a>
      </li>
      <li class="page-item active">
        <a class="page-link" href="#">3</a>
      </li>
      <li class="page-item">
        <a class="page-link" href="#">4</a>
      </li>
      <li class="page-item">
        <a class="page-link" href="#">5</a>
      </li>

      <li class="page-item">
        <a class="page-link" href="#">
          <!-- Download SVG icon from http://tabler.io/icons/icon/chevron-right -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="icon icon-1"
          >
            <path d="M9 6l6 6l-6 6" />
          </svg>
        </a>
      </li>
    </ul>
  `,
})
export class PaginationComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
