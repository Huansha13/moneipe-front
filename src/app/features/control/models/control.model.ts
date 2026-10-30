export interface Control {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: string;
  moneda: string;
  estadoControl: string;
  cantidadGastos: number;
  grupoId: string | null;
}
