import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { SupabaseService } from '../../services/supabase.service';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ClientesService {
   constructor(private http: HttpClient,private supabase: SupabaseService) {}
  buscarClientes(termino: string): Observable<any[]> {
  return from(
    this.supabase.client
      .from('cliente')
      .select('id, nombre, numero_ruc')
      .ilike('nombre', `%${termino}%`) // Busca coincidencias parciales
      .limit(5)
  ).pipe(map(res => res.data || []));
}
}
