import { IRole } from './role.interface';

export interface IUser {
  activo: boolean;
  cedula: string;
  contra: string;
  correo: string;
  direccion: string;
  fecha_creacion: string;
  fecha_modificacion: string | null;
  id: number;
  id_login: string;
  nbr_usuario: string;
  nombre: string;
  telefono: string;
}
