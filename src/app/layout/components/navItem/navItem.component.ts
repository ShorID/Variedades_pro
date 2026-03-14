import { Component, computed, input, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, UrlSegment, RouterLink, NavigationEnd } from '@angular/router';
import { filter, Subscription, tap } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-navItem',
  styles: `
    .nav {
      margin-left: calc(calc(var(--tblr-page-padding) * 2) / 2);
      border-left: var(--tblr-border-width) var(--tblr-border-style) var(--tblr-border-color);
      padding-left: 0.5rem;
    }
  `,
  template: `
    <a
      [class]="{ 'nav-link': true, active: isActive }"
      [routerLink]="link()"
      data-bs-toggle="collapse"
      [attr.data-bs-toggle]="hasOptions() ? 'collapse' : null"
      [attr.data-bs-target]="hasOptions() ? '#' + navItemId : null"
    >
      <span class="nav-link-title" (click)="redirect()">
        <ng-content></ng-content>
      </span>
      @if (hasOptions()) {
        <span class="nav-link-toggle"></span>
      }
    </a>

    @if (hasOptions()) {
      <nav [class]="['nav', 'nav-vertical', 'collapse', isActive && 'show']" [id]="navItemId">
        <ng-content select="navItem-options"></ng-content>
      </nav>
    }
  `,
  imports: [RouterLink],
})
export class NavItemComponent implements OnInit, OnDestroy {
  name = input<string>('');
  link = input<string>('#');
  hasOptions = input<boolean>(false);

  navItemId: string = '';

  constructor(private router: Router) {}

  ngOnInit() {
    this.navItemId = this.name() ? this.name() : `nav-item-${uuidv4()}`;
  }

  ngOnDestroy(): void {
  }

  get isActive() {
    const url = this.router.url
    if (this.hasOptions()) return url.includes(this.link());
    return (url || '/') === this.link();
  }

  redirect() {
    if (this.hasOptions()) this.router.navigateByUrl(this.link());
  }
}
