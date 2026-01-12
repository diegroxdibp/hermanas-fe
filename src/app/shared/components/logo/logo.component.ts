import {
  emptyLogoConfigurationObject,
  LogoConfigurationObject,
} from './../../models/input-configuration-objects/logo-configuration-object';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'logo',
  imports: [],
  templateUrl: './logo.component.html',
  styleUrl: './logo.component.scss',
})
export class LogoComponent {
  @Input() logoConfig: LogoConfigurationObject = emptyLogoConfigurationObject;
}
