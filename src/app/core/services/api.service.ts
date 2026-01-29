import { SchedulingService } from './../../shared/services/scheduling.service';
import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { AvailabilityModel } from '../../shared/models/availability.model';
import { Roles } from '../../shared/enums/roles.enum';
import { AppointmentPayload } from '../../shared/models/appointment-payload.model';
import { AppConstants } from '../../app-constants';

import { HttpClient } from '@angular/common/http';
import { User } from '../../auth/user.model';
import { ProfessionalModel } from '../../shared/models/professional.model';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly http = inject(HttpClient);

  constructor(private schedulingService: SchedulingService) {}

  getCourses() {
    return this.http.get(AppConstants.apiEndpoints.root + '/api/courses');
  }

  getTherapists(): Observable<ProfessionalModel[]> {
    return this.http.post<ProfessionalModel[]>(
      AppConstants.apiEndpoints.root + '/api/user/findByRole',
      { role: Roles.THERAPIST },
      { withCredentials: true }
    );
  }

  getAvailabilitites(): Observable<AvailabilityModel[]> {
    return this.http.get<AvailabilityModel[]>(
      AppConstants.apiEndpoints.root + '/api/availability/getAll',
      { withCredentials: true }
    );
  }

  getAvailabilititesByProfessionalId(
    professionalId: number
  ): Observable<AvailabilityModel[]> {
    return this.http.get<AvailabilityModel[]>(
      AppConstants.apiEndpoints.root +
        `/api/availability/professional/${professionalId}`,
      { withCredentials: true }
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

  sendEmail(subject: string, body: string) {
    this.http
      .post(`${AppConstants.apiEndpoints.root}/email/send`, {
        to: 'diegrox.rox@gmail.com',
        subject,
        body,
      })
      .subscribe((response) => {
        console.log(response);
      });
  }
}
