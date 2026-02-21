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
import { formatTime } from '../../utils/date-helper.util';
import { FormsModule } from '@angular/forms';
import { ProfessionalServiceModality } from '../../enums/professional-service-modality.enum';
import { AvailabilityModel } from '../../models/availability.model';
import { AvailabilitySelectionOutputObject } from '../../models/input-configuration-objects/availability-selection-output-object';
import { Modality } from '../../enums/modality.enum';
import { getEnumKeyByValue } from '../../utils/getEnumKeyByValue';

@Component({
  selector: 'app-availabilities',
  imports: [
    MatButtonModule,
    MatExpansionModule,
    MatIconModule,
    MatDividerModule,
    MatButtonToggleModule,
    FormsModule,
  ],
  templateUrl: './availabilities.component.html',
  styleUrl: './availabilities.component.scss',
})
export class AvailabilitiesComponent {
  @Input({ required: true })
  availabilityConfiguration: AvailabilityConfigurationObject =
    emptyAvailabilityConfiguration;
  @Output('isSubmitted') isSubmitted =
    new EventEmitter<AvailabilitySelectionOutputObject>();
  modalitySelection = Modality.ANY;
  formatTime = formatTime;
  ProfessionalServiceModality = ProfessionalServiceModality;

  scheduleAppointment(availability: AvailabilityModel): void {
    const availabilityOutputObject = {
      availability: availability,
      modality: getEnumKeyByValue(Modality, this.modalitySelection) as Modality,
    };
    this.isSubmitted.emit(availabilityOutputObject);
  }
}
