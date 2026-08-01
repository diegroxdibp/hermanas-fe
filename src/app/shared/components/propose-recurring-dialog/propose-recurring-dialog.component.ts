import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from '../../../core/services/api.service';
import { Modality } from '../../enums/modality.enum';
import { getBookableModalities } from '../../utils/modality-compatibility.util';
import { PatientSummary } from '../../models/patient.model';

export interface ProposeDialogService {
  id: number;
  /** Already display-ready (e.g. via serviceDisplayName()), not the raw enum key. */
  name: string;
}

export interface ProposeRecurringDialogData {
  professionalId: number;
  /** The services this specific availability slot offers. */
  services: ProposeDialogService[];
  /** The slot's own configured modality (Qualquer/Presencial/Remoto). */
  slotModality: Modality;
  dayLabel: string;
  timeLabel: string;
  /** Already display-ready PT label ("Semanal"/"Quinzenal"/"Mensal"). */
  recurrenceFrequencyLabel: string;
}

export interface ProposeRecurringDialogResult {
  professionalServiceId: number;
  clientId: number;
  modality: Modality;
}

@Component({
  selector: 'app-propose-recurring-dialog',
  imports: [MatDialogModule],
  template: `
    <div class="dialog">
      <h3>Propor agendamento recorrente</h3>
      <p class="sub">Sessão {{ data.recurrenceFrequencyLabel.toLowerCase() }} · {{ data.dayLabel }} · {{ data.timeLabel }}</p>

      @if (data.services.length > 1) {
        <label class="field-label">Serviço</label>
        <div class="chips">
          @for (svc of data.services; track svc.id) {
            <button
              type="button"
              class="chip"
              [class.on]="selectedServiceId() === svc.id"
              (click)="selectedServiceId.set(svc.id)"
            >
              {{ svc.name }}
            </button>
          }
        </div>
      }

      @if (bookableModalities().length > 1) {
        <label class="field-label">Modalidade</label>
        <div class="chips">
          @for (m of bookableModalities(); track m) {
            <button
              type="button"
              class="chip"
              [class.on]="selectedModality() === m"
              (click)="selectedModality.set(m)"
            >
              {{ m }}
            </button>
          }
        </div>
      }

      <label class="field-label" for="patient-select">Paciente</label>
      @if (loading()) {
        <p class="hint">A carregar pacientes...</p>
      } @else if (patients().length === 0) {
        <p class="hint">Ainda não tem pacientes com sessões consigo.</p>
      } @else {
        <select
          id="patient-select"
          class="select"
          [value]="selectedClientId() ?? ''"
          (change)="selectedClientId.set($any($event.target).value ? +$any($event.target).value : null)"
        >
          <option value="" disabled>Selecione um paciente</option>
          @for (p of patients(); track p.id) {
            <option [value]="p.id">{{ p.name }}</option>
          }
        </select>
      }

      @if (errorMessage()) {
        <p class="error">{{ errorMessage() }}</p>
      }

      <div class="btns">
        <button class="btn-ghost" (click)="cancel()">Cancelar</button>
        <button class="btn-primary" [disabled]="!canSubmit() || sending()" (click)="submit()">
          {{ sending() ? 'A enviar...' : 'Enviar Proposta' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .dialog {
      width: 100%;
      max-width: 440px;
      padding: 8px 0 0;
      box-sizing: border-box;
      font-family: var(--font-sans);
    }
    h3 {
      font-size: 22px;
      font-weight: 700;
      color: var(--color-primary-blue);
      margin: 0 0 4px;
      line-height: 1.2;
    }
    .sub {
      font-size: 13px;
      color: var(--color-muted);
      margin: 0 0 20px;
    }
    .field-label {
      display: block;
      font-size: 12px;
      font-weight: 600;
      color: var(--color-muted);
      letter-spacing: 0.3px;
      margin: 0 0 8px;
    }
    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 18px;
    }
    .chip {
      border: 1px solid var(--color-border);
      background: #fff;
      color: var(--color-primary-blue);
      border-radius: var(--radius-pill);
      padding: 8px 16px;
      font-size: 13px;
      font-weight: 600;
      font-family: var(--font-sans);
      cursor: pointer;
      transition: background 0.15s ease, color 0.15s ease;

      &.on {
        background: var(--color-primary-blue);
        color: #fff;
        border-color: var(--color-primary-blue);
      }
    }
    .select {
      width: 100%;
      box-sizing: border-box;
      padding: 10px 12px;
      border-radius: var(--radius-md);
      border: 1px solid var(--color-border);
      background: #fff;
      color: var(--color-primary-blue);
      font-family: var(--font-sans);
      font-size: 14px;
      margin-bottom: 18px;
    }
    .hint {
      font-size: 13px;
      color: var(--color-muted);
      margin: 0 0 18px;
    }
    .error {
      font-size: 13px;
      color: #c0392b;
      margin: -6px 0 14px;
    }
    .btns {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
    }
    .btn-ghost {
      padding: 12px 22px;
      border-radius: var(--radius-md);
      border: 0;
      background: transparent;
      color: var(--color-primary-blue);
      font-family: var(--font-sans);
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      cursor: pointer;
      transition: background 0.2s ease;
      &:hover { background: var(--color-surface-tint); }
    }
    .btn-primary {
      padding: 12px 22px;
      border-radius: var(--radius-md);
      border: 0;
      background: var(--color-primary-blue);
      color: #fff;
      font-family: var(--font-sans);
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      cursor: pointer;
      transition: opacity 0.2s ease;
      &:hover { opacity: 0.88; }
      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }
  `],
})
export class ProposeRecurringDialogComponent implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<ProposeRecurringDialogComponent>);
  private readonly apiService = inject(ApiService);
  readonly data = inject<ProposeRecurringDialogData>(MAT_DIALOG_DATA);

  readonly bookableModalities = computed(() => getBookableModalities(this.data.slotModality));

  readonly patients = signal<PatientSummary[]>([]);
  readonly loading = signal<boolean>(true);
  readonly sending = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  readonly selectedServiceId = signal<number | null>(
    this.data.services.length === 1 ? this.data.services[0].id : null,
  );
  readonly selectedClientId = signal<number | null>(null);
  readonly selectedModality = signal<Modality>(this.bookableModalities()[0]);

  readonly canSubmit = computed(() =>
    this.selectedServiceId() !== null &&
    this.selectedClientId() !== null &&
    this.selectedModality() !== undefined,
  );

  ngOnInit(): void {
    this.apiService.getPatients(this.data.professionalId).subscribe({
      next: (patients) => {
        this.patients.set(patients);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Não foi possível carregar os pacientes. Tente novamente.');
        this.loading.set(false);
      },
    });
  }

  cancel(): void {
    this.dialogRef.close(null);
  }

  submit(): void {
    const professionalServiceId = this.selectedServiceId();
    const clientId = this.selectedClientId();
    if (professionalServiceId === null || clientId === null) return;

    const result: ProposeRecurringDialogResult = {
      professionalServiceId,
      clientId,
      modality: this.selectedModality(),
    };
    this.dialogRef.close(result);
  }
}
