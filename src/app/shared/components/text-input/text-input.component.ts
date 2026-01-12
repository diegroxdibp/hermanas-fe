import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppConstants } from '../../../app-constants';
import {
  emptyTextInputConfigurationObject,
  TextInputConfigurationObject,
} from '../../models/input-configuration-objects/text-input-configuration-object';
import { Component, Input, OnInit } from '@angular/core';
import { DynamicFormatPipe } from '../../pipes/dynamic-format.pipe';
import { FormatType } from '../../enums/format-type.enum';

@Component({
  selector: 'app-text-input',
  imports: [FormsModule, ReactiveFormsModule, DynamicFormatPipe],
  templateUrl: './text-input.component.html',
  styleUrl: './text-input.component.scss',
})
export class TextInputComponent implements OnInit {
  AppConstants = AppConstants;
  @Input() configurationObject: TextInputConfigurationObject =
    emptyTextInputConfigurationObject;

  ngOnInit(): void {
    // const formattedValue = this.applyFormat(
    //   this.configurationObject.control.value,
    //   this.configurationObject.formatType
    // );

    // this.configurationObject.control.setValue(formattedValue);
    // if (this.configurationObject.disabled) {
    //   this.configurationObject.control.disable();
    // }
  }

  passwordRules = {
    minLength: 8,
    maxLength: 128,
    lowercase: /[a-z]/,
    uppercase: /[A-Z]/,
    digit: /\d/,
    specialChar: /[\W_]/,
  };

  get passwordStatus() {
    if (
      this.configurationObject.title ===
      AppConstants.authentication.passwordInputTitle
    ) {
      const pwd = this.configurationObject.control.value ?? '';
      return {
        minLength: pwd.length >= this.passwordRules.minLength,
        maxLength: pwd.length <= this.passwordRules.maxLength,
        lowercase: this.passwordRules.lowercase.test(pwd),
        uppercase: this.passwordRules.uppercase.test(pwd),
        digit: this.passwordRules.digit.test(pwd),
        specialChar: this.passwordRules.specialChar.test(pwd),
      };
    } else {
      return {};
    }
  }

  private applyFormat(value: any, formatType?: FormatType): any {
    console.log(this.configurationObject,'value:',value, 'type:', formatType)

    if (!formatType || !value) return value;


    const pipe = new DynamicFormatPipe();
    return pipe.transform(value, formatType);
  }
}
