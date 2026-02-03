import { UserService } from './../../services/user.service';
import { Component, inject, OnInit } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { SessionService } from '../../services/session.service';
import { User } from '../../../auth/user.model';
import { MatDividerModule } from '@angular/material/divider';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { FormService } from '../../../core/services/form.service';
import { filter } from 'rxjs';

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
  readonly router = inject(Router);
  readonly route = inject(ActivatedRoute);

  title = '';
  subtitle = '';

  ngOnInit(): void {
    this.userService
      .getProfile()
      .subscribe((profileData: User) =>
        this.formService.fillProfileFields(profileData),
      );

    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => {
        this.updateHeader();
      });

    this.updateHeader();
  }

  private updateHeader() {
    let route = this.route;

    while (route.firstChild) {
      route = route.firstChild;
    }

    const data = route.snapshot.data;

    this.title = data['title'] ?? '';
    this.subtitle = data['subtitle'] ?? '';
  }
}
