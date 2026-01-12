import { Component, ElementRef, ViewChild } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';

@Component({
  selector: 'app-contact',
  imports: [MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatDivider],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
})
export class ContactComponent {
  @ViewChild('body') body: ElementRef | undefined;
  @ViewChild('subject') subject: ElementRef | undefined;
  constructor(public apiService: ApiService) {}

  handleScheduleButton() {
    this.apiService.sendEmail(
      this.subject?.nativeElement.value,
      this.body?.nativeElement.value
    );
    console.log(
      'Subject:',
      this.body?.nativeElement.value,
      'Body:',
      this.body?.nativeElement.value
    );
  }
}
