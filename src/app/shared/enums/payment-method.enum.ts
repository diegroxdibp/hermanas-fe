import { Currency } from './currency.enum';

export enum PaymentMethod {
  MBWAY = 'MBWAY',
  CARD = 'CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  PIX = 'PIX',
}

export interface PaymentMethodOption {
  value: PaymentMethod;
  label: string;
}

/**
 * Os métodos dependem da moeda de cobrança — MB Way só existe em Portugal, Pix
 * só no Brasil. A lista vem daqui e não do template, para que acrescentar um
 * método não implique mexer em markup.
 */
const METHODS_BY_CURRENCY: Record<Currency, PaymentMethodOption[]> = {
  [Currency.EUR]: [
    { value: PaymentMethod.MBWAY, label: 'MB Way' },
    { value: PaymentMethod.CARD, label: 'Cartão de crédito ou débito' },
    { value: PaymentMethod.BANK_TRANSFER, label: 'Transferência bancária' },
  ],
  [Currency.BRL]: [
    { value: PaymentMethod.PIX, label: 'Pix' },
    { value: PaymentMethod.CARD, label: 'Cartão de crédito ou débito' },
    { value: PaymentMethod.BANK_TRANSFER, label: 'Transferência bancária' },
  ],
};

export function paymentMethodsFor(currency: Currency): PaymentMethodOption[] {
  return METHODS_BY_CURRENCY[currency] ?? METHODS_BY_CURRENCY[Currency.EUR];
}
