import { Component } from '@angular/core';
import { AnaliseCorporalReichanaComponent } from "../analise-corporal-reichana/analise-corporal-reichana.component";
import { MindfulnessComponent } from "../mindfulness/mindfulness.component";

@Component({
  selector: 'app-service',
  imports: [AnaliseCorporalReichanaComponent, MindfulnessComponent],
  templateUrl: './service.component.html',
  styleUrl: './service.component.scss',
  standalone: true
})
export class ServiceComponent {

}
