import { IRole } from './role.interface';

export interface IRawUser {
  id: number;
  nombre: string;
  cedula: string;
  telefono: string;
  direccion: string;
  correo: string;
  contra: string;
  nbr_usuario: string;
  fecha_creacion: string;
  fecha_modificacion: string | null;
  activo: boolean;
  id_login: string;
  usu_rol?: Array<{
    rol: { nombre: string; rol_per?: Array<{ permiso: { nombre: string; descripcion: string } }> };
  }>;
}

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
  roles: string[]
  permissions: string[]
}
