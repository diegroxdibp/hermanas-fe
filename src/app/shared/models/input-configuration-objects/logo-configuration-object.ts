import { Logo } from '../../enums/logo.enum';

export interface LogoConfigurationObject {
  name: Logo;
}

export const emptyLogoConfigurationObject: LogoConfigurationObject = {
  name: Logo.CARE,
};
