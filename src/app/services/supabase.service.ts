import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private supabase: SupabaseClient;
  private sessionKey: string = 'sb-session'

  constructor() {
    this.supabase = createClient(environment.apiUrl, environment.apiToken);
    this.restoreSession();
    this.listenSessionChange();
  }

  private listenSessionChange() {
    this.supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        sessionStorage.setItem(this.sessionKey, JSON.stringify(session));
      } else {
        sessionStorage.removeItem(this.sessionKey);
      }
    });
  }

  private restoreSession() {
    const savedSession = sessionStorage.getItem(this.sessionKey);

    if (savedSession) {
      const session = JSON.parse(savedSession);

      this.supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      });
    }
  }

  get client() {
    return this.supabase;
  }

  async getSession() {
    const { data } = await this.supabase.auth.getSession();
    return data.session;
  }

  async signOut() {
    await this.supabase.auth.signOut();
  }

  rpc(fn: string, params?: object) {
  return this.supabase.rpc(fn, params);
}

}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const supabase = inject(SupabaseService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        supabase.client.auth.signOut();
        router.navigate(['/login']);
      }
      return throwError(() => err);
    }),
  );
};
