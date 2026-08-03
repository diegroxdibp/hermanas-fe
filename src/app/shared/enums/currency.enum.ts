export enum Currency {
  EUR = 'EUR',
  BRL = 'BRL',
}

export interface CurrencyMeta {
  /** Nome exibido na UI. */
  name: string;
  /** Símbolo curto usado no seletor e nos preços. */
  symbol: string;
  /** Locale usado no Intl.NumberFormat. */
  locale: string;
}

export const CURRENCY_META: Record<Currency, CurrencyMeta> = {
  [Currency.EUR]: { name: 'Euro', symbol: '€', locale: 'pt-PT' },
  [Currency.BRL]: { name: 'Real', symbol: 'R$', locale: 'pt-BR' },
};

export const CURRENCIES: Currency[] = [Currency.EUR, Currency.BRL];

/**
 * Moeda padrão a partir do país já informado no onboarding
 * (`CountryModel.code`, minúsculo — ex.: 'br', 'pt').
 * Brasil cobra em real; o resto da operação da CARE cobra em euro.
 */
export function currencyForCountry(code?: string | null): Currency {
  return (code ?? '').toLowerCase() === 'br' ? Currency.BRL : Currency.EUR;
}

/** Formata um valor já expresso na moeda indicada (nunca converte). */
export function formatPrice(amount: number, currency: Currency): string {
  const meta = CURRENCY_META[currency];
  return new Intl.NumberFormat(meta.locale, {
    style: 'currency',
    currency,
  }).format(amount);
}
