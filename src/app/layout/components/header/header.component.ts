import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { TextComponent } from '../../../components/Text/text.component';
import { AuthService } from '../../../login/services/auth.service';
import { IconComponent } from '../../../components/Icon/icon.component';
import { AuthHttpServices } from '../../../login/services/auth-https.services';
import { Subscription, tap } from 'rxjs';
import { RouterLink } from '@angular/router';
import { IUser } from '../../../login/interfaces/user.interface';
import { BreadcrumbsComponent } from "../../../components/Breadcrumbs/breadcrumbs.component";

@Component({
  selector: 'app-header',
  template: `
    <header class="navbar navbar-expand-md d-print-none">
      <div class="container-xl">
        <app-breadcrumb />
        <div class="navbar-nav flex-row order-md-last ms-auto">
          <div class="nav-item dropdown">
            <a
              href="#"
              class="nav-link d-flex lh-1 text-reset"
              data-bs-toggle="dropdown"
              aria-label="Open user menu"
            >
              <span class="avatar avatar-sm">
                <app-icon name="CircleUser" />
              </span>
              <div class="d-none d-xl-block ps-2">
                <div>{{ userInfo()?.nombre }}</div>
                <div class="mt-1 small text-secondary">{{ userInfo()?.roles?.join(',') }}</div>
              </div>
            </a>
            <div class="dropdown-menu dropdown-menu-end dropdown-menu-arrow">
              <a href="#" class="dropdown-item">Status</a>
              <a href="./profile.html" class="dropdown-item">Profile</a>
              <a href="#" class="dropdown-item">Feedback</a>
              <div class="dropdown-divider"></div>
              <a href="./settings.html" class="dropdown-item">Settings</a>
              <a routerLink="/login" (click)="logout()" class="dropdown-item">Logout</a>
            </div>
          </div>
        </div>
      </div>
    </header>
  `,
  imports: [IconComponent, RouterLink, BreadcrumbsComponent],
})
export class HeaderComponent implements OnInit, OnDestroy {
  suscription: Subscription[] = [];
  userInfo = signal<IUser | null>(null);

  constructor(
    protected authService: AuthService,
    private authHttpService: AuthHttpServices,
  ) {}

  ngOnInit() {
    this.suscription.push(
      this.authService.user$.pipe(tap((user) => this.userInfo.set(user))).subscribe(),
    );
  }

  ngOnDestroy(): void {
    this.suscription.forEach((i) => i.unsubscribe());
  }

  logout() {
    this.authHttpService
      .logout()
      .pipe(
        tap(() => {
          this.authService.logout();
        }),
      )
      .subscribe();
  }
}
