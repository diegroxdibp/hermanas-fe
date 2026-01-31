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
import { AvailabilityType } from '../../enums/availability-type.enum';
import { FormsModule } from '@angular/forms';
import { ProfessionalServiceModality } from '../../enums/professional-service-modality.enum';
import { JsonPipe } from '@angular/common';
@Component({
  selector: 'app-availabilities',
  imports: [
    MatButtonModule,
    MatExpansionModule,
    MatIconModule,
    MatDividerModule,
    MatButtonToggleModule,
    FormsModule,
    JsonPipe
  ],
  templateUrl: './availabilities.component.html',
  styleUrl: './availabilities.component.scss',
})
export class AvailabilitiesComponent {
  @Input({ required: true })
  availabilityConfiguration: AvailabilityConfigurationObject =
    emptyAvailabilityConfiguration;
  @Output('isSubmitted') isSubmitted = new EventEmitter<AvailabilityType>();
  typeSelection = AvailabilityType.ANY;
  formatTime = formatTime;
  AvailabilityType = AvailabilityType;
  ProfessionalServiceModality = ProfessionalServiceModality;

  scheduleAppointment(): void {
    console.log(this.typeSelection);
    this.isSubmitted.emit(this.typeSelection);
  }

  isLocalDisabled(modality: ProfessionalServiceModality): boolean {
    return modality === ProfessionalServiceModality.REMOTE;
  }

  isRemoteDisabled(modality: ProfessionalServiceModality): boolean {
    return modality === ProfessionalServiceModality.LOCAL;
  }

  isAnyDisabled(modality: ProfessionalServiceModality): boolean {
    return modality !== ProfessionalServiceModality.ANY;
  }
}
