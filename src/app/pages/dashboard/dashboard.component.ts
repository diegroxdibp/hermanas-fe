import { Component, computed, inject, OnInit, signal } from '@angular/core';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { CommonModule } from '@angular/common';
import { SessionService } from '../../shared/services/session.service';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../auth/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { Appointment } from '../../shared/models/appointment.model';
import { DayOfWeek } from '../../shared/enums/day-of-week.enum';
import { Modality } from '../../shared/enums/modality.enum';
import { Pages } from '../../shared/enums/pages.enum';
import { ProfessionalService } from '../../shared/models/professional-service.model';
import { filter } from 'rxjs';

export interface DashSession {
  date: Date;
  dow: string;
  fullDow: string;
  day: number;
  month: string;
  who: string;
  service: string;
  startTime: string;
  endTime: string;
  mode: 'Presencial' | 'Online';
}

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardPageComponent implements OnInit {
  private readonly sessionService = inject(SessionService);
  private readonly apiService = inject(ApiService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  readonly notificationService = inject(NotificationService);

  readonly Pages = Pages;

  readonly appointments = signal<Appointment[]>([]);
  private readonly services = signal<ProfessionalService[]>([]);
  readonly activeView = signal<'list' | 'calendar'>('list');
  readonly currentUrl = signal(this.router.url);

  readonly showSchedule = computed(() => {
    const url = this.currentUrl();
    return url === '/dashboard' || url === '/dashboard/';
  });

  readonly user = this.sessionService.user;

  readonly userInitials = computed(() => {
    const parts = (this.user()?.name ?? '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '?';
    return parts.length === 1
      ? parts[0][0].toUpperCase()
      : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  });

  readonly firstName = computed(() => this.user()?.name?.split(' ')[0] ?? '');

  readonly greeting = computed(() => {
    const h = new Date().getHours();
    return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
  });

  readonly todayFormatted = computed(() =>
    new Intl.DateTimeFormat('pt-PT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date()),
  );

  private readonly sessions = computed(() =>
    this.buildSessions(this.appointments(), this.services()),
  );

  readonly nextSession = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const all = this.sessions();
    return all.find(s => s.date >= today) ?? all[all.length - 1] ?? null;
  });

  readonly upcomingSessions = computed(() => {
    const next = this.nextSession();
    if (!next) return [];
    return this.sessions().filter(s => s !== next).slice(0, 4);
  });

  private static readonly DOW_ABR: Record<string, string> = {
    SUNDAY: 'Dom',    [DayOfWeek.SUNDAY]: 'Dom',
    MONDAY: 'Seg',    [DayOfWeek.MONDAY]: 'Seg',
    TUESDAY: 'Ter',   [DayOfWeek.TUESDAY]: 'Ter',
    WEDNESDAY: 'Qua', [DayOfWeek.WEDNESDAY]: 'Qua',
    THURSDAY: 'Qui',  [DayOfWeek.THURSDAY]: 'Qui',
    FRIDAY: 'Sex',    [DayOfWeek.FRIDAY]: 'Sex',
    SATURDAY: 'Sáb',  [DayOfWeek.SATURDAY]: 'Sáb',
  };

  private static readonly DOW_FULL: Record<string, string> = {
    SUNDAY: 'Domingo',    [DayOfWeek.SUNDAY]: 'Domingo',
    MONDAY: 'Segunda',    [DayOfWeek.MONDAY]: 'Segunda',
    TUESDAY: 'Terça',     [DayOfWeek.TUESDAY]: 'Terça',
    WEDNESDAY: 'Quarta',  [DayOfWeek.WEDNESDAY]: 'Quarta',
    THURSDAY: 'Quinta',   [DayOfWeek.THURSDAY]: 'Quinta',
    FRIDAY: 'Sexta',      [DayOfWeek.FRIDAY]: 'Sexta',
    SATURDAY: 'Sábado',   [DayOfWeek.SATURDAY]: 'Sábado',
  };

  private static readonly DOW_JS: Record<string, number> = {
    SUNDAY: 0,    [DayOfWeek.SUNDAY]: 0,
    MONDAY: 1,    [DayOfWeek.MONDAY]: 1,
    TUESDAY: 2,   [DayOfWeek.TUESDAY]: 2,
    WEDNESDAY: 3, [DayOfWeek.WEDNESDAY]: 3,
    THURSDAY: 4,  [DayOfWeek.THURSDAY]: 4,
    FRIDAY: 5,    [DayOfWeek.FRIDAY]: 5,
    SATURDAY: 6,  [DayOfWeek.SATURDAY]: 6,
  };

  private static readonly MONTHS = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
  ];

  ngOnInit(): void {
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e: NavigationEnd) => this.currentUrl.set(e.urlAfterRedirects));

    const user = this.sessionService.user();

    if (user?.email) {
      this.apiService.getUserAppointments(user.email).subscribe((appts) =>
        this.appointments.set(appts),
      );
    }

    this.apiService.getServices().subscribe((svcs) => this.services.set(svcs));
  }

  setView(v: 'list' | 'calendar'): void {
    this.activeView.set(v);
  }

  logout(): void {
    this.authService.logout();
  }

  private buildSessions(appointments: Appointment[], services: ProfessionalService[]): DashSession[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const limit = new Date(today);
    limit.setMonth(limit.getMonth() + 12);

    const sessions: DashSession[] = [];

    for (const appt of appointments) {
      const dates = appt.isRecurring
        ? this.recurringDates(appt, today, limit)
        : this.oneTimeDates(appt);

      const serviceName = services.find(s => s.id === appt.professionalServiceId)?.name ?? '';

      for (const date of dates) {
        sessions.push({
          date,
          dow: DashboardPageComponent.DOW_ABR[appt.dayOfWeek] ?? '?',
          fullDow: DashboardPageComponent.DOW_FULL[appt.dayOfWeek] ?? '?',
          day: date.getDate(),
          month: DashboardPageComponent.MONTHS[date.getMonth()],
          who: appt.professionalName,
          service: serviceName,
          startTime: appt.startTime?.slice(0, 5) ?? '',
          endTime: appt.endTime?.slice(0, 5) ?? '',
          mode: appt.modality === Modality.REMOTE ? 'Online'
              : appt.modality === Modality.LOCAL ? 'Presencial'
              : 'Presencial',
        });
      }
    }

    return sessions.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  private recurringDates(appt: Appointment, from: Date, limit: Date): Date[] {
    const targetDay = DashboardPageComponent.DOW_JS[appt.dayOfWeek];
    if (targetDay === undefined) return [];

    const start = appt.startDate ? new Date(appt.startDate) : new Date(from);
    start.setHours(0, 0, 0, 0);
    const end = appt.endDate ? new Date(appt.endDate) : new Date(limit);
    end.setHours(23, 59, 59, 999);

    const base = from > start ? new Date(from) : new Date(start);
    const diff = (targetDay - base.getDay() + 7) % 7;
    base.setDate(base.getDate() + diff);

    const finalLimit = end < limit ? end : limit;
    const dates: Date[] = [];
    while (base <= finalLimit && dates.length < 10) {
      dates.push(new Date(base));
      base.setDate(base.getDate() + 7);
    }
    return dates;
  }

  private oneTimeDates(appt: Appointment): Date[] {
    if (!appt.startDate) return [];
    const d = new Date(appt.startDate);
    d.setHours(0, 0, 0, 0);
    return [d];
  }
}
