import { Countries } from '../../../assets/countries';
import { CountryModel, defaultCountry } from '../models/country.model';

// Guesses the user's country from their browser locale (e.g. "pt-PT", "en-US"),
// falling back to defaultCountry when nothing usable is available or matches.
export function getBrowserCountry(): CountryModel {
  if (typeof navigator === 'undefined') return defaultCountry;

  const locales = navigator.languages?.length ? navigator.languages : [navigator.language];

  for (const locale of locales) {
    if (!locale) continue;

    let region: string | undefined;
    try {
      region = new Intl.Locale(locale).maximize().region;
    } catch {
      const parts = locale.split('-');
      region = parts.length > 1 ? parts[parts.length - 1] : undefined;
    }

    if (region) {
      const match = Countries.find(c => c.code === region!.toLowerCase());
      if (match) return match;
    }
  }

  return defaultCountry;
}
