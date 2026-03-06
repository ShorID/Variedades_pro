import { Component, effect, OnDestroy, OnInit, signal } from '@angular/core';
import { of, Subscription, switchMap, tap } from 'rxjs';
import { AuthService } from '../login/services/auth.service';
import { Router, RouterOutlet } from '@angular/router';
import { TextComponent } from '../components/Text/text.component';
import { HeaderComponent } from './components/header/header.component';
import { NavItemComponent } from './components/navItem/navItem.component';
import { IconComponent } from '../components/Icon/icon.component';
import { AuthHttpServices } from '../login/services/auth-https.services';

@Component({
  selector: 'selector-name',
  templateUrl: './layout.component.html',
  imports: [RouterOutlet, TextComponent, HeaderComponent, NavItemComponent, IconComponent],
})
export class LayoutComponent implements OnInit, OnDestroy {
  protected readonly title = signal('inventary-prototype');
  subscriptions: Subscription[] = [];
  showSidebar: boolean = false;

  constructor(
    private authService: AuthService,
    private authHttpService: AuthHttpServices,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const isLogin = this.authService.isLogin();
    if (!isLogin)
      this.authHttpService
        .getAuthUserId()
        .pipe(
          switchMap(({ data, error }) => {
            if (error || !data) {
              this.redirectToLogin()
              return of(null);
            }
            return this.authHttpService.getUserInfo(data.user.id).pipe(
              tap(({ error, data }) => {
                if (error) {
                  this.redirectToLogin()
                  console.error('No se encontro ningun usuario relacionado a este login.')
                }
                if (data && data.length) {
                  const user = this.authService.buildUserData(data[0]);
                  this.authService.setLogin(user);
                }
              }),
            );
          }),
        )
        .subscribe();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((item) => item.unsubscribe());
  }

  redirectToLogin(){
    this.router.navigateByUrl('/login')
  }

  toLoginEvent(e: Event) {
    e.preventDefault();
  }

  handleSidebar() {
    this.showSidebar = !this.showSidebar;
  }
}
