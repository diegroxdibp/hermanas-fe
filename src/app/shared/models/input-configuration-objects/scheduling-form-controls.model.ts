import { ProfessionalService } from '../professional-service.model';
import { AvailabilityModel } from '../availability.model';
import { ControlsOf } from '../../utils/values-to-type-controls.util';
import { SchedulingFormControls } from '../../enums/scheduling-form-controls.enum';
import { Professional } from '../get-professional-by-service-response.model';
import { Modality } from '../../enums/modality.enum';

export interface SchedulingFormValue {
  [SchedulingFormControls.CLIENT_ID]: number | null;
  [SchedulingFormControls.SELECTED_SERVICE]: ProfessionalService | null;
  [SchedulingFormControls.SELECTED_DAY]: string | null;
  [SchedulingFormControls.SELECTED_TIME_SLOT]: string | null;
  [SchedulingFormControls.SELECTED_PROFESSIONAL]: Professional | null;
  [SchedulingFormControls.SELECTED_MODALITY]: Modality | null;
  [SchedulingFormControls.SELECTED_AVAILABILITY]: AvailabilityModel | null;
}

export type SchedulingFormModel = ControlsOf<SchedulingFormValue>;
