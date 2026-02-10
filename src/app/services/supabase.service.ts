import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.apiUrl, environment.apiToken);
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
