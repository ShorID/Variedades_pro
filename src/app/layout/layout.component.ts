import { Component, effect, OnDestroy, OnInit, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../login/services/auth.service';
import { Router, RouterOutlet } from '@angular/router';
import { TextComponent } from '../components/Text/text.component';
import { HeaderComponent } from './components/header/header.component';
import { NavItemComponent } from './components/navItem/navItem.component';
import { IconComponent } from '../components/Icon/icon.component';

@Component({
  selector: 'selector-name',
  templateUrl: './layout.component.html',
  imports: [RouterOutlet, TextComponent, HeaderComponent, NavItemComponent, IconComponent],
})
export class LayoutComponent implements OnInit, OnDestroy {
  protected readonly title = signal('inventary-prototype');
  isLogin = signal<boolean>(false);
  subscriptions: Subscription[] = [];
  showSidebar: boolean = false;

  isLoginEffect = effect(() => {
    const isLogin = this.isLogin();
    if (!isLogin) this.router.navigateByUrl('/login');
  });

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.authService.isLogin$.subscribe((isLogin) => this.isLogin.set(isLogin)),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((item) => item.unsubscribe());
    this.isLoginEffect.destroy();
  }

  handleSidebar() {
    this.showSidebar = !this.showSidebar;
  }
}
