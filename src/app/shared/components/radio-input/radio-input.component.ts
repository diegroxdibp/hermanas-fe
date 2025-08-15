import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import {
  emptyRadioInputConfiguration,
  RadioInputConfigurationObject,
} from '../../models/input-configuration-objects/radio-input-configuration-object';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-radio-input',
  imports: [CommonModule, ReactiveFormsModule, MatRadioGroup, MatRadioButton],
  templateUrl: './radio-input.component.html',
  styleUrl: './radio-input.component.scss',
})
export class RadioInputComponent {
  @Input({ required: true })
  inputConfiguration: RadioInputConfigurationObject =
    emptyRadioInputConfiguration;
}
