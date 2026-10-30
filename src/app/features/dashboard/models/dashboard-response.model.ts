export interface ControlResponse {
  id: string;
  titulo: string;
  descripcion: string | null;
  grupoId: string | null;
  estadoControl?: string;
  tipo?: string;
}

export interface GrupoResponse {
  id: string;
  nombre: string;
  descripcion: string | null;
}

export interface PortafolioResponse {
  id: string;
  nombre: string;
  descripcion: string | null;
  moneda: string;
}
