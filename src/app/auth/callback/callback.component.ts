import { Component, inject } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-callback',
  imports: [],
  templateUrl: './callback.component.html',
  styleUrl: './callback.component.scss',
})
export class CallbackComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  ngOnInit() {
    this.auth.refreshSession().subscribe({
      next: (user) => {
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.router.navigate(['/auth/login']);
      },
    });
  }
}
