import { Component, computed, OnInit, signal } from '@angular/core';
import { TextComponent } from '../components/Text/text.component';
import { InputComponent } from '../components/Form/Input/Input.component';
import { AuthService } from './services/auth.service';
import { LucideAngularModule, Store, Warehouse } from 'lucide-angular';
import { Router } from '@angular/router';
import { IconComponent } from '../components/Icon/icon.component';
import { AuthHttpServices } from './services/auth-https.services';
import { catchError, filter, map, of, switchMap, tap } from 'rxjs';
import { validateEmail } from '../utils/commons';

@Component({
  selector: 'login',
  standalone: true,
  template: `
    <div class="card">
      <div class="card-header text-center d-block">
        <span
          class="p-2 bg-primary text-white mx-auto d-block mb-3"
          style="border-radius: 50%;width: fit-content;"
        >
          <app-icon [name]="'Store'" />
        </span>
        <Text tag="h2" bold="black" [italic]="true" class="mb-4 d-block"> Variedades Pro </Text>
        <Text>Gestión Inteligente de Inventario y Ventas</Text>
      </div>
      <div class="card-body">
        @if (errorMsg()) {
          <div class="alert alert-warning" role="alert">
            <div class="alert-icon">
              <app-icon name="CircleAlert" />
            </div>
            <div>
              <h4 class="alert-heading">Uh oh, algo salio mal!</h4>
              <div class="alert-description">{{ errorMsg() }}</div>
            </div>
          </div>
        }
        <app-input
          label="Correo electronico"
          name="email"
          (onChange)="changeForm($event)"
          class="mb-3"
          [iClass]="(invalidEmail() && 'is-invalid') || ''"
        >
          @if (invalidEmail()) {
            <div class="invalid-feedback">Por favor, ingrese un correo electronico valido!</div>
          }
        </app-input>
        <app-input
          label="Contraseña"
          name="password"
          (onChange)="changeForm($event)"
          class="mb-3"
          iType="password"
        />
        <button
          (click)="login()"
          class="btn btn-primary w-100"
          [disabled]="!formData()['email'] || !formData()['password']"
        >
          <Text>
            Acceder
            @if (loading()) {
              <div class="spinner-border spinner-border-sm ms-2" role="status"></div>
            }
          </Text>
        </button>
        <Text class="text-muted text-center d-block mt-2" [tag]="'smallBody'">
          V 0.2.0 • Authorized Personnel Only
        </Text>
      </div>
    </div>
  `,
  styleUrl: './login.component.scss',
  imports: [TextComponent, InputComponent, LucideAngularModule, IconComponent],
})
export class LoginComponent implements OnInit {
  readonly icons = { Warehouse, Store };
  formData = signal<Record<string, string>>({ email: '', password: '' });
  loading = signal<boolean>(false);
  errorMsg = signal<string>('');

  invalidEmail = computed(() => {
    if (this.formData()['email']) return !validateEmail(this.formData()['email']);
    return false;
  });

  constructor(
    private authService: AuthService,
    private authHttpService: AuthHttpServices,
    private router: Router,
  ) {}

  ngOnInit() {}

  changeForm(e: Event) {
    const { name, value } = e.target as HTMLInputElement;
    if (name in this.formData()) this.formData.update((prev) => ({ ...prev, [name]: value }));
  }

  login() {
    this.loading.update(() => true);
    this.authHttpService
      .login(this.formData()['email'], this.formData()['password'])
      .pipe(
        map(({ error, data }) => {
          if (error) {
            console.error(error);
            this.errorMsg.update(() => 'Email o contraseña equivocados!');
            return null;
          }
          this.errorMsg.update(() => '');
          return data;
        }),
        catchError(() => {
          this.loading.update(() => false);
          return of(null);
        }),
        filter((res) => !!res),
        switchMap((dataAuth) => {
          return this.authHttpService.getUserInfo(dataAuth.user.id).pipe(
            tap(({ error, data }) => {
              if (error) this.errorMsg.update(() => 'No se encontro datos del email registrado.');
              if (data && data.length) {
                // this.authService.setLogin(true);
                const user = this.authService.buildUserData(data[0]);
                this.authService.setLogin(user);
                this.router.navigateByUrl('/');
              }
            }),
          );
        }),
      )
      .subscribe((e) => {
        console.log('prro final');
        this.loading.update(() => false);
      });
  }
}
