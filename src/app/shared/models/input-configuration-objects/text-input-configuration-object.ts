import { FormControl } from '@angular/forms';
import { InputType } from '../../enums/input-type.enum';
import { FormatType } from '../../enums/format-type.enum';

export interface TextInputConfigurationObject {
  inputType: InputType;
  title: string;
  subTitle?: string;
  placeHolder?: string;
  control: FormControl;
  showValidationTips?: boolean;
  formatType?: FormatType;
  disabled?: boolean;
}

export const emptyTextInputConfigurationObject: TextInputConfigurationObject = {
  inputType: InputType.TEXT,
  title: '',
  control: new FormControl(),
  formatType: FormatType.DEFAULT,
  disabled: false,
};
