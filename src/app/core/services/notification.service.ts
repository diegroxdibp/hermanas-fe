import { Injectable, OnDestroy, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import {
  BroadcastNotificationRequest,
  NotificationResponse,
  UnreadCountResponse,
} from '../../shared/models/notification.types';

/**
 * Call connect() after the user logs in and disconnect() on logout.
 * Exposes read-only signals so components can react without manual subscriptions.
 *
 * Example (in a root layout component):
 *   authService.isLoggedIn$.subscribe(loggedIn =>
 *     loggedIn ? this.notificationService.connect() : this.notificationService.disconnect()
 *   );
 */
@Injectable({ providedIn: 'root' })
export class NotificationService implements OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/notifications';

  private readonly _notifications = signal<NotificationResponse[]>([]);
  private readonly _connected = signal(false);
  private eventSource: EventSource | null = null;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

  /** All notifications for the authenticated user, newest first. */
  readonly notifications = this._notifications.asReadonly();

  /** Derived count — no extra HTTP call needed. */
  readonly unreadCount = computed(
    () => this._notifications().filter((n) => !n.read).length,
  );

  /** True while the SSE connection is open. */
  readonly connected = this._connected.asReadonly();

  /** Open the SSE stream and load the initial notification list. */
  connect(): void {
    if (this.eventSource) return;

    this.http.get<NotificationResponse[]>(this.baseUrl).subscribe({
      next: (list) => this._notifications.set(list),
    });

    this.eventSource = new EventSource(`${this.baseUrl}/stream`, {
      withCredentials: true,
    });

    this.eventSource.onopen = () => this._connected.set(true);

    this.eventSource.addEventListener('notification', (event: MessageEvent) => {
      const notification: NotificationResponse = JSON.parse(event.data);
      this._notifications.update((list) => [notification, ...list]);
    });

    this.eventSource.onerror = () => {
      this._connected.set(false);
      this.closeEventSource();
      // Reconnect after 5 s — browser EventSource also retries automatically,
      // but this gives us control and restores the connected signal.
      this.reconnectTimeout = setTimeout(() => this.connect(), 5_000);
    };
  }

  /** Close the SSE stream (call on logout or component destroy). */
  disconnect(): void {
    if (this.reconnectTimeout !== null) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    this.closeEventSource();
    this._notifications.set([]);
  }

  /** Mark a single notification as read and update local state. */
  markAsRead(id: number): Observable<NotificationResponse> {
    return this.http
      .patch<NotificationResponse>(`${this.baseUrl}/${id}/read`, {})
      .pipe(
        tap((updated) =>
          this._notifications.update((list) =>
            list.map((n) => (n.id === id ? updated : n)),
          ),
        ),
      );
  }

  /** Mark all notifications as read and update local state. */
  markAllAsRead(): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/read-all`, {}).pipe(
      tap(() =>
        this._notifications.update((list) =>
          list.map((n) => ({ ...n, read: true })),
        ),
      ),
    );
  }

  /**
   * Fetch unread count directly from the server.
   * Prefer the `unreadCount` signal for reactive UIs — this is for one-shot checks.
   */
  fetchUnreadCount(): Observable<UnreadCountResponse> {
    return this.http.get<UnreadCountResponse>(`${this.baseUrl}/unread-count`);
  }

  /** Admin only — send a targeted notification by roles and optional services. */
  broadcast(request: BroadcastNotificationRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/broadcast`, request);
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
