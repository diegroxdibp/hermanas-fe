import { Component, Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  DropDownConfigurationObject,
  emptyDropDownConfigurationObject,
} from '../../models/input-configuration-objects/drop-down-configuration-object';

@Component({
  selector: 'app-drop-down',
  imports: [FormsModule, MatInputModule, MatSelectModule, MatFormFieldModule, ReactiveFormsModule],
  templateUrl: './drop-down.component.html',
  styleUrl: './drop-down.component.scss',
})
export class DropDownComponent {
  @Input() dropDownConfigurationObject: DropDownConfigurationObject =
    emptyDropDownConfigurationObject;
}
