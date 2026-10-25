import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { firstValueFrom } from 'rxjs';
import { GroupMessage, MensajeResponse } from '../models/group-message.model';

@Injectable({
  providedIn: 'root'
})
export class GroupChatService {
  private readonly http = inject(HttpClient);

  private get apiUrl(): string {
    return `${environment.apiUrl}/api/notificaciones`;
  }

  private readonly messagesSignal = signal<Record<string, GroupMessage[]>>({});

  messages = this.messagesSignal.asReadonly();

  async loadMessages(groupId: string): Promise<void> {
    try {
      const msgs = await firstValueFrom(
        this.http.get<MensajeResponse[]>(`${this.apiUrl}/grupos/${groupId}/mensajes`)
      );
      const mapped: GroupMessage[] = msgs.map(m => ({
        id: m.id,
        author: m.usuarioId,
        text: m.texto,
        mine: false,
        time: new Date(m.fecha).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}),
      }));
      this.messagesSignal.update(state => ({ ...state, [groupId]: mapped }));
    } catch (err) {
      console.error('Error cargando mensajes:', err);
    }
  }

  async send(groupId: string, text: string): Promise<void> {
    try {
      const msg = await firstValueFrom(
        this.http.post<MensajeResponse>(
          `${this.apiUrl}/grupos/${groupId}/mensajes`,
          { texto: text }
        )
      );
      const message: GroupMessage = {
        id: msg.id,
        author: 'Tu',
        text: msg.texto,
        mine: true,
        time: new Date(msg.fecha).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}),
      };
      this.messagesSignal.update(state => ({
        ...state,
        [groupId]: [...(state[groupId] ?? []), message]
      }));
    } catch (err) {
      console.error('Error enviando mensaje:', err);
    }
  }
}
