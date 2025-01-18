import { Component } from '@angular/core';
import { HeaderComponent } from "./shared/components/header/header.component";
import { FooterComponent } from './shared/components/footer/footer.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: true,
})
export class AppComponent {
  title = 'hermanas-fe';
}
