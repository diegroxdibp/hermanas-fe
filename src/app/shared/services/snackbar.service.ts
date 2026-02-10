import {
  dafultSnackbarConfiguration,
  SnackbarConfigurationObject,
} from './../models/input-configuration-objects/snackbar-configuration-object';
import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomSnackbarComponent } from '../components/custom-snackbar/custom-snackbar.component';

@Injectable({
  providedIn: 'root',
})
export class SnackbarService {
    private _snackBar = inject(MatSnackBar);
  snackbarConfigurationObject: SnackbarConfigurationObject =
    dafultSnackbarConfiguration;

  openSnackBar(snackbarConfigurationObject?: SnackbarConfigurationObject) {
    this.snackbarConfigurationObject = {
      ...dafultSnackbarConfiguration,
      ...snackbarConfigurationObject,
    };

    const duration = this.snackbarConfigurationObject.duration! * 1000;

    this._snackBar.openFromComponent(CustomSnackbarComponent, {
      data: {
        message: this.snackbarConfigurationObject.message,
        action: this.snackbarConfigurationObject.action,
        duration: duration,
      },
      horizontalPosition: this.snackbarConfigurationObject.horizontalPosition,
      verticalPosition: this.snackbarConfigurationObject.verticalPosition,
      duration: duration,
      panelClass: ['custom-snackbar'],
    });
  }
}
