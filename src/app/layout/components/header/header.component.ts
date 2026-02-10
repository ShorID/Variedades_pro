import { Component, OnInit } from '@angular/core';
import { TextComponent } from '../../../components/Text/text.component';
import { AuthService } from '../../../login/services/auth.service';
import { IconComponent } from '../../../components/Icon/icon.component';

@Component({
  selector: 'app-header',
  template: `
    <header class="navbar navbar-expand-md d-print-none">
      <div class="container-xl">
        <div class="me-auto d-flex">
          <app-icon name="MapPinHouse" [size]="32" class="d-flex align-items-center me-2 text-danger" />
          <div class="text-black">
            <Text tag="smallBody" tagClass="page-pretitle"> Chinandega </Text>
            <Text tag="h5" bold="bold" tagClass="d-block"> Tienda de prueba </Text>
          </div>
        </div>
        <div class="navbar-nav flex-row order-md-last ms-auto">
          <div class="nav-item dropdown">
            <a
              href="#"
              class="nav-link d-flex lh-1 text-reset"
              data-bs-toggle="dropdown"
              aria-label="Open user menu"
            >
              <span
                class="avatar avatar-sm"
                style="background-image: url(/static/avatars/044m.jpg)"
              ></span>
              <div class="d-none d-xl-block ps-2">
                <div>Paweł Kuna</div>
                <div class="mt-1 small text-secondary">UI Designer</div>
              </div>
            </a>
            <div class="dropdown-menu dropdown-menu-end dropdown-menu-arrow">
              <a href="#" class="dropdown-item">Status</a>
              <a href="./profile.html" class="dropdown-item">Profile</a>
              <a href="#" class="dropdown-item">Feedback</a>
              <div class="dropdown-divider"></div>
              <a href="./settings.html" class="dropdown-item">Settings</a>
              <a href="./sign-in.html" class="dropdown-item">Logout</a>
            </div>
          </div>
        </div>
      </div>
    </header>
  `,
  imports: [TextComponent, IconComponent],
})
export class HeaderComponent implements OnInit {
  constructor(protected authService: AuthService) {}

  ngOnInit() {}

  logout() {
    this.authService.setLogin(false);
  }
}
