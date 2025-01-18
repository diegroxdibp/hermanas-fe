import { Component, input, Input } from '@angular/core';

@Component({
  selector: 'app-service',
  imports: [],
  templateUrl: './service.component.html',
  styleUrl: './service.component.scss',
  standalone: true
})
export class ServiceComponent {
  title = input<string>("Title");
  subTitle = input<string>("");
  description = input<string>("");
  imgUrl = input<string>("");
}
