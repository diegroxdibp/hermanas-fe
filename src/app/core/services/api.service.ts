import { SessionService } from './../../shared/services/session.service';
import { SchedulingService } from './../../shared/services/scheduling.service';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AvailabilityModel } from '../../shared/models/availability.model';

export interface AvailabilityPayload {
  professionalServiceIds: number[];
  startDate: string;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
}
import { Roles } from '../../shared/enums/roles.enum';
import { AppointmentPayload } from '../../shared/models/appointment-payload.model';
import { AppConstants } from '../../app-constants';

import { HttpClient } from '@angular/common/http';
import { ProfessionalModel } from '../../shared/models/professional.model';
import { environment } from '../../../environments/environment';
import { ProfessionalService } from '../../shared/models/professional-service.model';
import { ProfessionalSessionService } from '../../shared/enums/professional-session-service.enum';
import { Professional } from '../../shared/models/get-professional-by-service-response.model';
import { Appointment } from '../../shared/models/appointment.model';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly http = inject(HttpClient);

  // getCourses() {
  //   return this.http.get(AppConstants.apiEndpoints.root + '/api/courses');
  // }

  getTherapists(): Observable<ProfessionalModel[]> {
    return this.http.post<ProfessionalModel[]>(
      environment.apiUrl + '/api/user/findByRole',
      { role: Roles.THERAPIST },
      { withCredentials: true },
    );
  }

  getAvailabilitites(): Observable<AvailabilityModel[]> {
    return this.http.get<AvailabilityModel[]>(
      environment.apiUrl + '/api/availability/getAll',
      { withCredentials: true },
    );
  }

  getAvailabilitiesByProfessionalId(
    professionalId: number,
  ): Observable<AvailabilityModel[]> {
    return this.http.get<AvailabilityModel[]>(
      environment.apiUrl + `/api/availability/professional/${professionalId}`,
      { withCredentials: true },
    );
  }

  getAvailabilititesByService(
    sessionService: ProfessionalSessionService,
  ): Observable<ProfessionalService[]> {
    return this.http.get<ProfessionalService[]>(
      environment.apiUrl + `/api/availability/service/${sessionService}`,
      { withCredentials: true },
    );
  }

  getServices(): Observable<ProfessionalService[]> {
    return this.http.get<ProfessionalService[]>(
      environment.apiUrl + `/api/services/getAll`,
      { withCredentials: true },
    );
  }

  getProfessionalByService(serviceId: number): Observable<Professional[]> {
    return this.http.get<Professional[]>(
      environment.apiUrl + `/api/services/${serviceId}/professionals`,
      { withCredentials: true },
    );
  }

  setAppointment(payload: AppointmentPayload): Observable<any> {
    return this.http.post(
      `${environment.apiUrl}/api/appointments/create`,
      payload,
      {
        withCredentials: true,
      },
    );
  }

  getUserAppointments(userEmail: string): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(
      `${environment.apiUrl}/api/appointments/client/email/${userEmail}`,
      {
        withCredentials: true,
      },
    );
  }

  createAvailability(payload: AvailabilityPayload): Observable<AvailabilityModel> {
    return this.http.post<AvailabilityModel>(
      `${environment.apiUrl}/api/availability/create`,
      payload,
      { withCredentials: true },
    );
  }

  updateAvailability(id: number, payload: AvailabilityPayload): Observable<AvailabilityModel> {
    return this.http.put<AvailabilityModel>(
      `${environment.apiUrl}/api/availability/${id}`,
      payload,
      { withCredentials: true },
    );
  }

  deleteAvailability(id: number): Observable<void> {
    return this.http.delete<void>(
      `${environment.apiUrl}/api/availability/delete/${id}`,
      { withCredentials: true },
    );
  }

  sendEmail(subject: string, body: string) {
    this.http
      .post(`${environment.apiUrl}/email/send`, {
        to: 'diegrox.rox@gmail.com',
        subject,
        body,
      })
      .subscribe((response) => {
        console.log(response);
      });
  }
}
