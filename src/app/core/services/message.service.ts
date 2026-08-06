import { Injectable, OnDestroy, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, tap } from 'rxjs';
import { ChatMessage, MessageSlice, Thread } from '../../shared/models/message.model';
import { environment } from '../../../environments/environment';

/**
 * Espelha o NotificationService (mesma ligação SSE, mesmo padrão de sinais).
 * Chamar connect() depois do login e disconnect() no logout — ver
 * app.component.ts, onde as duas ligações já convivem lado a lado.
 */
@Injectable({ providedIn: 'root' })
export class MessageService implements OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/threads`;

  private readonly _threads = signal<Thread[]>([]);
  private readonly _connected = signal(false);
  private eventSource: EventSource | null = null;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

  /** Todas as threads do utilizador autenticado. */
  readonly threads = this._threads.asReadonly();

  /** Soma das não lidas de todas as threads — alimenta o badge do menu. */
  readonly unreadCount = computed(() =>
    this._threads().reduce((sum, t) => sum + t.unreadCount, 0),
  );

  readonly connected = this._connected.asReadonly();

  /** Mensagens recebidas ao vivo — a conversa aberta filtra pelo threadId. */
  private readonly _incoming = new Subject<ChatMessage>();
  readonly incoming$ = this._incoming.asObservable();

  connect(): void {
    if (this.eventSource) return;

    this.http.get<Thread[]>(this.baseUrl).subscribe({
      next: (list) => this._threads.set(list),
    });

    this.eventSource = new EventSource(`${this.baseUrl}/stream`, {
      withCredentials: true,
    });

    this.eventSource.onopen = () => this._connected.set(true);

    this.eventSource.addEventListener('message', (event: MessageEvent) => {
      const message: ChatMessage = JSON.parse(event.data);
      this._incoming.next(message);
      // Reconsulta a lista para atualizar preview/não-lidas — simples e
      // suficiente para o volume de threads de um utilizador.
      this.http.get<Thread[]>(this.baseUrl).subscribe({
        next: (list) => this._threads.set(list),
      });
    });

    this.eventSource.onerror = () => {
      this._connected.set(false);
      this.closeEventSource();
      this.reconnectTimeout = setTimeout(() => this.connect(), 5_000);
    };
  }

  disconnect(): void {
    if (this.reconnectTimeout !== null) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    this.closeEventSource();
    this._threads.set([]);
  }

  listMessages(threadId: number, page = 0, size = 20): Observable<MessageSlice> {
    return this.http.get<MessageSlice>(`${this.baseUrl}/${threadId}/messages`, {
      params: { page, size },
      withCredentials: true,
    });
  }

  sendMessage(threadId: number, body: string): Observable<ChatMessage> {
    return this.http.post<ChatMessage>(
      `${this.baseUrl}/${threadId}/messages`,
      { body },
      { withCredentials: true },
    );
  }

  markRead(threadId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${threadId}/read`, {}, { withCredentials: true }).pipe(
      tap(() =>
        this._threads.update((list) =>
          list.map((t) => (t.id === threadId ? { ...t, unreadCount: 0 } : t)),
        ),
      ),
    );
  }

  createOrGetThread(appointmentId: number): Observable<Thread> {
    return this.http
      .post<Thread>(this.baseUrl, { appointmentId }, { withCredentials: true })
      .pipe(
        tap((thread) =>
          this._threads.update((list) =>
            list.some((t) => t.id === thread.id)
              ? list.map((t) => (t.id === thread.id ? thread : t))
              : [thread, ...list],
          ),
        ),
      );
  }

  ngOnDestroy(): void {
    this.disconnect();
  }

  private closeEventSource(): void {
    this.eventSource?.close();
    this.eventSource = null;
    this._connected.set(false);
  }
}
