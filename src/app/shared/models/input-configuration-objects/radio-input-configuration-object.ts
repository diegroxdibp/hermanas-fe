import { FormControl } from '@angular/forms';

export interface RadioInputConfigurationObject {
  title?: string;
  control: FormControl;
  listOfOptions: string[];
}

export const emptyRadioInputConfiguration: RadioInputConfigurationObject = {
  title: '',
  control: new FormControl(),
  listOfOptions: [],
};
