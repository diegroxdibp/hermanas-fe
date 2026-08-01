import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ApiService } from '../../../core/services/api.service';
import { SnackbarService } from '../../services/snackbar.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { Appointment } from '../../models/appointment.model';
import { normalizeModality } from '../../utils/modality-compatibility.util';
import { normalizeRecurrenceFrequency } from '../../utils/recurrence.util';
import { DayOfWeek } from '../../enums/day-of-week.enum';
import { ProfessionalSessionService } from '../../enums/professional-session-service.enum';

@Component({
  selector: 'app-proposal-confirm',
  imports: [MatDialogModule],
  templateUrl: './proposal-confirm.component.html',
  styleUrl: './proposal-confirm.component.scss',
})
export class ProposalConfirmComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly apiService = inject(ApiService);
  private readonly snackbarService = inject(SnackbarService);
  private readonly dialog = inject(MatDialog);

  readonly loading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly respondError = signal<string | null>(null);
  readonly responding = signal(false);
  readonly appt = signal<Appointment | null>(null);
  readonly serviceName = signal<string>('');

  readonly dayLabel = computed(() => {
    const a = this.appt();
    if (!a) return '';
    return DayOfWeek[a.dayOfWeek as unknown as keyof typeof DayOfWeek] ?? String(a.dayOfWeek);
  });

  readonly modalityLabel = computed(() => {
    const a = this.appt();
    return a ? normalizeModality(String(a.modality)) : '';
  });

  readonly frequencyLabel = computed(() => {
    const a = this.appt();
    return normalizeRecurrenceFrequency(a?.recurrenceFrequency);
  });

  readonly timeLabel = computed(() => {
    const a = this.appt();
    if (!a) return '';
    return `${a.startTime.slice(0, 5)}–${a.endTime.slice(0, 5)}`;
  });

  readonly alreadyResolved = computed(() => {
    const a = this.appt();
    return (a != null && a.status !== 'PENDING') || this.respondError() !== null;
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.loadError.set('Proposta inválida.');
      this.loading.set(false);
      return;
    }

    this.apiService.getAppointmentById(id).subscribe({
      next: (appt) => {
        this.appt.set(appt);
        this.loading.set(false);
        this.apiService.getServices().subscribe({
          next: (services) => {
            const svc = services.find(s => s.id === appt.professionalServiceId);
            this.serviceName.set(svc ? this.serviceDisplayName(svc.name) : '');
          },
        });
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 403) {
          this.loadError.set('Esta proposta não pertence à sua conta.');
        } else if (err.status === 404) {
          this.loadError.set('Proposta não encontrada.');
        } else {
          this.loadError.set('Não foi possível carregar a proposta. Tente novamente.');
        }
      },
    });
  }

  private serviceDisplayName(key: string): string {
    return ProfessionalSessionService[key as keyof typeof ProfessionalSessionService] ?? key;
  }

  accept(): void {
    this.respond(true);
  }

  decline(): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '440px',
      panelClass: 'care-dialog',
      data: {
        title: 'Recusar proposta',
        message: 'Deseja realmente recusar esta proposta de agendamento recorrente?',
        confirmLabel: 'Recusar',
      },
    });
    ref.afterClosed().subscribe(confirmed => {
      if (confirmed) this.respond(false);
    });
  }

  private respond(accept: boolean): void {
    const a = this.appt();
    if (!a || this.responding()) return;
    this.responding.set(true);
    this.respondError.set(null);

    this.apiService.respondToProposal(a.id, accept).subscribe({
      next: () => {
        this.snackbarService.openSnackBar({
          message: accept ? 'Proposta aceite com sucesso.' : 'Proposta recusada.',
        });
        this.router.navigateByUrl('/dashboard');
      },
      error: (err) => {
        this.responding.set(false);
        if (err.status === 409) {
          this.respondError.set('Esta proposta já foi respondida anteriormente.');
        } else if (err.status === 403) {
          this.respondError.set('Esta proposta não pertence à sua conta.');
        } else {
          this.snackbarService.openSnackBar({ message: 'Erro ao responder à proposta. Tente novamente.' });
        }
      },
    });
  }
}
