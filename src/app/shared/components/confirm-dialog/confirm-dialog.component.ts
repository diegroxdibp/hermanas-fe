import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

export interface ConfirmDialogData {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** When set, renders a required textarea and returns its value alongside the confirmation. */
  justificationLabel?: string;
  justificationPlaceholder?: string;
}

export interface ConfirmDialogResult {
  confirmed: true;
  justification: string;
}

@Component({
  selector: 'app-confirm-dialog',
  imports: [ReactiveFormsModule, MatDialogModule],
  template: `
    <div class="dialog">
      <h3>{{ data.title ?? 'Confirmar exclusão' }}</h3>
      <p class="body">{{ data.message }}</p>
      @if (data.justificationLabel) {
        <p class="confirm-label">{{ data.justificationLabel }}</p>
        <textarea
          class="justification-input"
          rows="3"
          [formControl]="justificationCtrl"
          [placeholder]="data.justificationPlaceholder ?? ''"
        ></textarea>
      }
      <div class="btns">
        <button class="btn-ghost" (click)="cancel()">{{ data.cancelLabel ?? 'Cancelar' }}</button>
        <button
          class="btn-danger"
          [disabled]="data.justificationLabel && !justificationCtrl.value?.trim()"
          (click)="confirm()"
        >{{ data.confirmLabel ?? 'Confirmar' }}</button>
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
      margin: 0 0 10px;
      line-height: 1.2;
    }
    .body {
      font-size: 15px;
      line-height: 1.55;
      color: var(--color-primary-blue);
      margin: 0 0 24px;
      text-align: left;
    }
    .confirm-label {
      font-size: 14px;
      line-height: 1.5;
      color: var(--color-primary-blue);
      margin: -14px 0 10px;
      text-align: left;
    }
    .justification-input {
      font-family: var(--font-sans);
      font-size: 15px;
      color: var(--color-primary-blue);
      padding: 13px 16px;
      border-radius: var(--radius-md);
      border: 1px solid var(--color-border);
      background: #fff;
      outline: none;
      width: 100%;
      box-sizing: border-box;
      margin-bottom: 24px;
      resize: vertical;
      transition: border-color 0.2s ease;
      &:focus { border-color: var(--color-primary-blue); }
      &::placeholder { color: var(--color-muted); }
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
    .btn-danger {
      padding: 12px 22px;
      border-radius: var(--radius-md);
      border: 0;
      background: #c0392b;
      color: #fff;
      font-family: var(--font-sans);
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      cursor: pointer;
      transition: opacity 0.2s ease;
      &:hover:not(:disabled) { opacity: 0.88; }
      &:disabled { opacity: 0.4; cursor: not-allowed; }
    }
  `],
})
export class ConfirmDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<ConfirmDialogComponent>);
  readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
  readonly justificationCtrl = new FormControl('');

  cancel(): void {
    this.dialogRef.close(false);
  }

  confirm(): void {
    if (!this.data.justificationLabel) {
      this.dialogRef.close(true);
      return;
    }

    const justification = this.justificationCtrl.value?.trim();
    if (!justification) return;

    this.dialogRef.close({ confirmed: true, justification } satisfies ConfirmDialogResult);
  }
}
