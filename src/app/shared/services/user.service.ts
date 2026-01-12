import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { SessionService } from './session.service';
import { Observable, switchMap, tap } from 'rxjs';
import { User } from '../../auth/user.model';
import { OnboardingPayload } from '../models/onboarding-payload.model';
import { AppConstants } from '../../app-constants';
import { AuthService } from '../../auth/auth.service';
import { OnboardingResponse } from '../models/onboarding-response.model';
import { ProfileView } from '../models/profile-view.model';
import { UpdateProfilePayload } from '../models/update-profile-payload.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  http = inject(HttpClient);
  authService = inject(AuthService);
  sessionService = inject(SessionService);

  getProfile(): Observable<User> {
    return this.http
      .get<User>(AppConstants.apiEndpoints.getProfile, {
        withCredentials: true,
      })
      .pipe(tap((user: User) => this.sessionService.setUser(user)));
  }

  onboarding(payload: OnboardingPayload): Observable<OnboardingResponse> {
    return this.http.put<OnboardingResponse>(
      AppConstants.apiEndpoints.onboarding,
      payload,
      {
        withCredentials: true,
      }
    );
  }

  updateProfile(payload: UpdateProfilePayload): Observable<User> {
    return this.http
      .put<User>(AppConstants.apiEndpoints.updateProfile, payload, {
        withCredentials: true,
      })
      .pipe(
        tap((updatedUser: User) =>
          this.sessionService.updateUser(updatedUser)
        )
      );
  }
}
