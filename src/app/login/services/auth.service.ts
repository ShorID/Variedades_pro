import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { IRawUser, IUser } from '../interfaces/user.interface';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private user = new BehaviorSubject<IUser | null>(null);
  user$ = this.user.asObservable();
  isLogin$ = this.user$.pipe(map((user) => !!(user?.id && user?.id_login)));
  role$ = this.user$.pipe(map((user) => user?.roles));

  constructor() {}

  setLogin(user: IUser) {
    this.user.next(user);
  }

  isLogin() {
    const user = this.user.getValue();
    return user?.id && user?.id_login;
  }

  buildUserData(rawData: IRawUser): IUser {
    const roles: string[] = [];
    const permissions: string[] = [];

    rawData.usu_rol?.forEach((item) => {
      roles.push(item.rol.nombre);
      item.rol.rol_per?.forEach((p) => permissions.push(p.permiso.nombre));
    });

    return {
      ...rawData,
      roles,
      permissions,
    };
  }

  logout() {
    this.user.next(null);
  }
// En tu servicio de auth
getCurrentUser(): IUser | null {
  return this.user.getValue(); // getValue() extrae el último objeto IUser guardado
}


}
