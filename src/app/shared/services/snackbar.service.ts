import {
  dafultSnackbarConfiguration,
  SnackbarConfigurationObject,
} from './../models/input-configuration-objects/snackbar-configuration-object';
import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

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

    this._snackBar.open(
      this.snackbarConfigurationObject.message,
      this.snackbarConfigurationObject.closeButtonMessage,
      {
        horizontalPosition: this.snackbarConfigurationObject.horizontalPosition,
        verticalPosition: this.snackbarConfigurationObject.verticalPosition,
        duration: this.snackbarConfigurationObject.duration! * 1000,
      },
    );
  }
}
