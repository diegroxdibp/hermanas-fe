import { FormControl } from '@angular/forms';

export interface DropDownConfigurationObject {
  title?: string;
  label?: string;
  placeHolder?: string;
  control: FormControl;
  values: string[];
}

export const emptyDropDownConfigurationObject: DropDownConfigurationObject = {
  title: '',
  label: 'Options',
  control: new FormControl(),
  values: [],
};
