import { AppConstants } from './../../../app-constants';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MaskitoDirective } from '@maskito/angular';
import { MaskitoOptions } from '@maskito/core';
import mask from '../../masks/date.mask';
@Component({
  selector: 'app-scheduling',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MaskitoDirective,
  ],
  templateUrl: './scheduling.component.html',
  providers: [provideNativeDateAdapter()],
  styleUrl: './scheduling.component.scss',
})
export class SchedulingComponent {
  readonly AppConstants = AppConstants;
  readonly options: MaskitoOptions = mask;
  timeSlots: string[] = [
    '18:30 - 19:30',
    '19:30 - 20:30',
    '18:30 - 19:30',
    '19:30 - 20:30',
    '20:30 - 21:30',
    '21:30 - 22:30',
  ];
  availableTimeSlots: string[] = [
    '19:30 - 20:30',
    '19:30 - 20:30',
    '20:30 - 21:30',
  ];
  timeForm: FormGroup;
  storedRanges: { start: string; end: string }[] = [];
  errorMessage: string = '';

  constructor(private fb: FormBuilder) {
    this.timeForm = this.fb.group({
      startTime: ['', [Validators.required, this.timeValidator.bind(this)]],
      endTime: ['', [Validators.required, this.timeValidator.bind(this)]],
    });
  }

  timeValidator(control: any) {
    const value = control.value;
    const regex = /^([01]\d|2[0-3]):([0-5]\d)$/; // Matches HH:mm format

    if (!regex.test(value)) {
      return { invalidFormat: true };
    }

    return null;
  }

  addTimeRange() {
    const { startTime, endTime } = this.timeForm.value;
    if (this.timeForm.valid && this.validateRange(startTime, endTime)) {
      this.storedRanges.push({ start: startTime, end: endTime });
      this.timeForm.reset();
      this.errorMessage = '';
    }
  }

  validateRange(startTime: string, endTime: string): boolean {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const start = startHour * 60 + startMin;
    const end = endHour * 60 + endMin;

    if (end <= start) {
      this.errorMessage = 'The end time must be later than the start time.';
      return false;
    }

    for (const range of this.storedRanges) {
      const [storedStartHour, storedStartMin] = range.start
        .split(':')
        .map(Number);
      const [storedEndHour, storedEndMin] = range.end.split(':').map(Number);
      const storedStart = storedStartHour * 60 + storedStartMin;
      const storedEnd = storedEndHour * 60 + storedEndMin;

      if (
        (start >= storedStart && start < storedEnd) ||
        (end > storedStart && end <= storedEnd) ||
        (start <= storedStart && end >= storedEnd)
      ) {
        this.errorMessage = 'Time range overlaps with an existing range.';
        return false;
      }
    }

    return true;
  }

  restrictInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/[^0-9]/g, ''); // Remove non-numeric characters immediately

    // Add ":" after the second digit
    if (value.length > 2) {
      value = value.slice(0, 2) + ':' + value.slice(2, 4);
    }

    // Prevent further input if max length (5 characters) is reached
    if (value.length > 5) {
      value = value.slice(0, 5); // Truncate excess characters
    }

    input.value = value; // Update the input value in real-time
  }
}
