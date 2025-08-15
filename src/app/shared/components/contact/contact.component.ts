import { Component } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs/internal/Observable';

@Component({
  selector: 'app-contact',
  imports: [CommonModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
})
export class ContactComponent {
  courses$: Observable<any>;

  constructor(public apiService: ApiService) {
    this.courses$ = this.apiService.getCourses();
  }
}
