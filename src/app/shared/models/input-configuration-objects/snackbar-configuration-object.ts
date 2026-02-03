import { SnackbarHorizontalPosition } from '../../enums/snackbar-horizontal-position.enum';
import { SnackbarVerticalPosition } from '../../enums/snackbar-vertical-position.enum';

export interface SnackbarConfigurationObject {
  message: string;
  closeButtonMessage?: string;
  horizontalPosition?: SnackbarHorizontalPosition;
  verticalPosition?: SnackbarVerticalPosition;
  duration?: number;
}

export const dafultSnackbarConfiguration: SnackbarConfigurationObject = {
  message: 'Snackbar message!',
  closeButtonMessage: 'Close',
  horizontalPosition: SnackbarHorizontalPosition.END,
  verticalPosition: SnackbarVerticalPosition.TOP,
  duration: 3,
};
