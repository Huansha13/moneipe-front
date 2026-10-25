export interface GroupMessage {
  id: string;
  author: string;
  text: string;
  mine: boolean;
  time: string;
}

export interface MensajeResponse {
  id: string;
  grupoId: string;
  usuarioId: string;
  texto: string;
  fecha: string;
}
