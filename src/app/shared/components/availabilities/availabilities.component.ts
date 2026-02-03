import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
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
import { SnackbarService } from '../../services/snackbar.service';
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
  snackbarService = inject(SnackbarService);
  @Input({ required: true })
  availabilityConfiguration: AvailabilityConfigurationObject =
    emptyAvailabilityConfiguration;
  @Output('isSubmitted') isSubmitted = new EventEmitter<AvailabilityType>();
  typeSelection = AvailabilityType.ANY;
  formatTime = formatTime;
  ProfessionalServiceModality = ProfessionalServiceModality;

  scheduleAppointment(): void {
    console.log(this.typeSelection);
    this.isSubmitted.emit(this.typeSelection);
    this.snackbarService.openSnackBar({ message: 'Serviço de agendamento em construção!' });
  }
}
