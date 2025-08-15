import { SchedulingService } from './../../shared/services/scheduling.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AvailabilityModel } from '../../shared/models/availability.model';
import { TherapistModel } from '../../shared/models/therapist.model';
import { Roles } from '../../shared/enums/roles.enum';
import { AppointmentPayload } from '../../shared/models/appointment-payload.model';
import { SchedulingFormControlNames } from '../../shared/enums/scheduling-form-control-names.enum';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  apiRootUrl: string = 'http://localhost:8080';
  constructor(
    private httpClient: HttpClient,
    private schedulingService: SchedulingService
  ) {}

  getCourses() {
    return this.httpClient.get(this.apiRootUrl + '/api/courses');
  }

  getTherapists(): Observable<TherapistModel[]> {
    return this.httpClient.post<TherapistModel[]>(
      this.apiRootUrl + '/users/findByRole',
      { role: Roles.THERAPIST }
    );
  }

  getAvailabilitites(): Observable<AvailabilityModel[]> {
    return this.httpClient.get<AvailabilityModel[]>(
      this.apiRootUrl + '/availability/getAll'
    );
  }

  setAppointment(payload: AppointmentPayload) {
    //     {
    //     "clientId": 1,
    //     "therapistId": 1,
    //     "appointmentDate": "2025-07-15",
    //     "startTime": "11:00:00",
    //     "endTime": "12:00:00",
    //     "isRecurring": true,
    //     "type":"REMOTE"
    // }
  }


}
