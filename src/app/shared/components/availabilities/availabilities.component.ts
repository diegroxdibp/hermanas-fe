import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import {
  AvailabilityConfigurationObject,
  emptyAvailabilityConfiguration,
} from '../../models/input-configuration-objects/availability-configuration-object';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { ApiService } from '../../../core/services/api.service';
import { formatTime } from '../../utils/date-helper.util';
import { AvailabilityType } from '../../enums/availability-type.enum';
@Component({
  selector: 'app-availabilities',
  imports: [
    MatButtonModule,
    MatExpansionModule,
    MatIconModule,
    MatDividerModule,
    MatButtonToggleModule,
  ],
  templateUrl: './availabilities.component.html',
  styleUrl: './availabilities.component.scss',
})
export class AvailabilitiesComponent {
  @Input({ required: true })
  availabilityConfiguration: AvailabilityConfigurationObject =
    emptyAvailabilityConfiguration;
  @Output('isSubmitted') isSubmitted = new EventEmitter<boolean>();
  formatTime = formatTime;
  AvailabilityType = AvailabilityType;
  constructor(private apiService: ApiService) {}

  scheduleAppointment(): void {
    console.log('Sched');
    this.isSubmitted.emit(true);
  }
}
