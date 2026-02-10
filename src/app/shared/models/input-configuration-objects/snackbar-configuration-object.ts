import { SnackbarHorizontalPosition } from '../../enums/snackbar-horizontal-position.enum';
import { SnackbarVerticalPosition } from '../../enums/snackbar-vertical-position.enum';

export interface SnackbarConfigurationObject {
  message: string;
  action?: boolean;
  horizontalPosition?: SnackbarHorizontalPosition;
  verticalPosition?: SnackbarVerticalPosition;
  duration?: number;
}

export const dafultSnackbarConfiguration: SnackbarConfigurationObject = {
  message: 'Snackbar message!',
  action: true,
  horizontalPosition: SnackbarHorizontalPosition.END,
  verticalPosition: SnackbarVerticalPosition.TOP,
  duration: 3,
};
