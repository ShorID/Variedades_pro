import { Injectable } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { from } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthHttpServices {
  constructor(private supabase: SupabaseService) {}

  login(email: string, password: string) {
    return from(this.supabase.client.auth.signInWithPassword({ email, password }));
  }

  getUserInfo(userId: string) {
    return from(
      this.supabase.client
        .from('usuario')
        .select('*, usu_rol!inner(rol!inner(nombre, rol_per!inner(permiso!inner(nombre, descripcion))))')
        .eq('id_login', userId),
    );
  }

  getAuthUserId() {
    return from(this.supabase.client.auth.getUser())
  }

  logout() {
    return from(this.supabase.signOut());
  }
}
