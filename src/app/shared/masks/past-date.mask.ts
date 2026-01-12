import { maskitoDateOptionsGenerator } from '@maskito/kit';
import { AppConstants } from '../../app-constants';

export default maskitoDateOptionsGenerator({
  mode: 'dd/mm/yyyy',
  separator: '/',
  min: AppConstants.birthdate.maxDate,
  max: AppConstants.birthdate.minDate
});
