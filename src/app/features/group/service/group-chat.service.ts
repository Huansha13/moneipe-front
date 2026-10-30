import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { firstValueFrom } from 'rxjs';
import Keycloak from 'keycloak-js';
import { AuthService } from '../../../core/auth/auth.service';
import { GroupService } from './group.service';
import { GroupMessage, MensajeResponse } from '../models/group-message.model';

interface NotificacionChat {
  tipo?: string;
  grupoId?: string;
  mensaje?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GroupChatService {
  private readonly http = inject(HttpClient);
  private readonly keycloak = inject(Keycloak);
  private readonly authService = inject(AuthService);
  private readonly groupService = inject(GroupService);

  private get apiUrl(): string {
    return `${environment.apiUrl}/api/notificaciones`;
  }

  private get currentUserId(): string {
    return this.keycloak.subject ?? this.authService.profile().userId;
  }

  private readonly messagesSignal = signal<Record<string, GroupMessage[]>>({});
  private readonly unreadCountsSignal = signal<Record<string, number>>({});
  private readonly activeGroupIdSignal = signal<string | null>(null);

  messages = this.messagesSignal.asReadonly();
  unreadCounts = this.unreadCountsSignal.asReadonly();

  constructor() {
    this.connectStream();
  }

  unreadCount(groupId: string): number {
    return this.unreadCountsSignal()[groupId] ?? 0;
  }

  setActiveGroup(groupId: string | null): void {
    this.activeGroupIdSignal.set(groupId);
    if (groupId) {
      this.unreadCountsSignal.update(state => ({ ...state, [groupId]: 0 }));
      void this.loadMessages(groupId);
    }
  }

  private resolveAuthor(usuarioId: string): string {
    if (usuarioId === this.currentUserId) {
      return this.authService.profile().fullName || 'Tu';
    }
    const info = this.groupService.groups()
      .flatMap(g => g.members)
      .find(m => m.id === usuarioId);
    return info?.name ?? usuarioId;
  }

  async loadMessages(groupId: string): Promise<void> {
    try {
      const msgs = await firstValueFrom(
        this.http.get<MensajeResponse[]>(`${this.apiUrl}/grupos/${groupId}/mensajes`)
      );
      const mapped: GroupMessage[] = msgs.map(m => ({
        id: m.id,
        author: this.resolveAuthor(m.usuarioId),
        text: m.texto,
        mine: m.usuarioId === this.currentUserId,
        time: new Date(m.fecha).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}),
      }));
      this.messagesSignal.update(state => ({ ...state, [groupId]: mapped }));
      this.unreadCountsSignal.update(state => ({ ...state, [groupId]: 0 }));
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
        author: this.resolveAuthor(msg.usuarioId),
        text: msg.texto,
        mine: true,
        time: new Date(msg.fecha).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}),
      };
      this.messagesSignal.update(state => ({
        ...state,
        [groupId]: [...(state[groupId] ?? []), message]
      }));

      // Notificar a los demás miembros del grupo (badge + tiempo real)
      const group = this.groupService.groups().find(g => g.id === groupId);
      const recipients = (group?.members ?? [])
        .map(m => m.id)
        .filter(id => id !== this.currentUserId);
      await Promise.allSettled(
        recipients.map(recipientId =>
          firstValueFrom(
            this.http.post(`${environment.apiUrl}/api/notificaciones`, {
              usuarioId: recipientId,
              tipo: 'CHAT',
              titulo: 'Nuevo mensaje',
              mensaje: text,
              grupoId: groupId,
            })
          )
        )
      );
    } catch (err) {
      console.error('Error enviando mensaje:', err);
    }
  }

  private connectStream(): void {
    const token = this.keycloak.token;
    if (!token) {
      setTimeout(() => this.connectStream(), 2000);
      return;
    }
    fetch(`${this.apiUrl}/stream`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'text/event-stream',
      },
    })
      .then(response => {
        if (!response.body) return;
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        const read = (): void => {
          reader.read().then(({ done, value }) => {
            if (done) {
              setTimeout(() => this.connectStream(), 3000);
              return;
            }
            buffer += decoder.decode(value, { stream: true });
            const parts = buffer.split('\n\n');
            buffer = parts.pop() ?? '';
            for (const part of parts) {
              const lines = part.split('\n');
              let data = '';
              for (const line of lines) {
                if (line.startsWith('data:')) {
                  data += line.slice(5).trim();
                }
              }
              if (data) {
                try {
                  const notif = JSON.parse(data) as NotificacionChat;
                  this.handleNotification(notif);
                } catch {
                  // ignore malformed events
                }
              }
            }
            read();
          }).catch(() => setTimeout(() => this.connectStream(), 3000));
        };
        read();
      })
      .catch(() => setTimeout(() => this.connectStream(), 3000));
  }

  private handleNotification(notif: NotificacionChat): void {
    if (notif?.tipo !== 'CHAT' || !notif.grupoId) return;
    const groupId = notif.grupoId;
    if (this.activeGroupIdSignal() === groupId) {
      void this.loadMessages(groupId);
    } else {
      this.unreadCountsSignal.update(state => ({
        ...state,
        [groupId]: (state[groupId] ?? 0) + 1,
      }));
    }
  }
}