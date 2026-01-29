import { UserService } from './../../services/user.service';
import { Component, inject, OnInit } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { SessionService } from '../../services/session.service';
import { User } from '../../../auth/user.model';
import { MatDividerModule } from '@angular/material/divider';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FormService } from '../../../core/services/form.service';

@Component({
  selector: 'app-user-dashboard',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatDividerModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.scss',
})
export class UserDashboardComponent implements OnInit {
  readonly sessionService = inject(SessionService);
  readonly userService = inject(UserService);
  readonly formService = inject(FormService);

  ngOnInit(): void {
    this.userService
      .getProfile()
      .subscribe((profileData: User) =>
        this.formService.fillProfileFields(profileData)
      );
  }
}
