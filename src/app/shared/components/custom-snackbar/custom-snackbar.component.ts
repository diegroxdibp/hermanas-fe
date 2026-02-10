import { Component, Inject } from '@angular/core';
import { MatSnackBarRef, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { SnackbarConfigurationObject } from '../../models/input-configuration-objects/snackbar-configuration-object';

@Component({
  selector: 'app-custom-snackbar',
  imports: [MatButtonModule, MatIcon],
  templateUrl: './custom-snackbar.component.html',
  styleUrl: './custom-snackbar.component.scss',
})
export class CustomSnackbarComponent {
  constructor(
    public snackBarRef: MatSnackBarRef<CustomSnackbarComponent>,
    @Inject(MAT_SNACK_BAR_DATA) public data: SnackbarConfigurationObject,
  ) {}
}
