import {Injectable, signal} from '@angular/core';

export interface GroupMessage {
  id: number;
  author: string;
  text: string;
  mine: boolean;
  time: string;
}

@Injectable({
  providedIn: 'root'
})
export class GroupChatService {
  private nextId = 100;

  private readonly messagesSignal = signal<Record<number, GroupMessage[]>>({
    1: [
      {id: 1, author: 'Ana Torres', text: '¡Hola a todos! ¿Planificamos el viaje del fin de semana?', mine: false, time: '09:12'},
      {id: 2, author: 'Tú', text: '¡Sí! Yo me encargo de la reserva.', mine: true, time: '09:15'},
      {id: 3, author: 'Luis Torres', text: 'Perfecto, yo llevo el almuerzo.', mine: false, time: '09:18'},
      {id: 4, author: 'María Torres', text: 'Cuento conmigo para el sábado.', mine: false, time: '09:21'}
    ],
    2: [
      {id: 5, author: 'Sofía Ramírez', text: '¿Alguien tiene las notas de la última clase?', mine: false, time: '16:40'},
      {id: 6, author: 'Tú', text: 'Te las paso por la noche.', mine: true, time: '16:45'}
    ],
    3: [
      {id: 7, author: 'Roberto Díaz', text: 'Recordatorio: reunión de equipo mañana a las 10.', mine: false, time: '08:30'}
    ],
    4: [],
    5: []
  });

  // Signal pública de solo lectura: mensajes agrupados por id de grupo
  messages = this.messagesSignal.asReadonly();

  send(groupId: number, text: string) {
    const message: GroupMessage = {
      id: this.nextId++,
      author: 'Tú',
      text,
      mine: true,
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
    };

    this.messagesSignal.update(state => ({
      ...state,
      [groupId]: [...(state[groupId] ?? []), message]
    }));
  }
}
