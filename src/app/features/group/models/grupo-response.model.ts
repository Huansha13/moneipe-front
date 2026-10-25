export interface GrupoResponse {
  id: string;
  nombre: string;
  descripcion: string | null;
  controlId: string | null;
  createdBy: string;
}

export interface MiembroResponse {
  grupoId: string;
  usuarioId: string;
  rol: string;
  fechaIngreso: string;
}
