import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IUser } from '../interfaces/user.interface';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private isLogin = new BehaviorSubject<boolean>(true);
  isLogin$ = this.isLogin.asObservable();
  
  private user = new BehaviorSubject<IUser | null>(null);
  user$ = this.user.asObservable();
  // role$ = this.user.asObservable().pipe(map((item) => item?.roles));

  constructor() {}

  setLogin(to: boolean) {
    this.isLogin.next(to);
  }
}
