import { Component, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Currency } from '../../enums/currency.enum';
import {
  PaymentMethod,
  PaymentMethodOption,
  paymentMethodsFor,
} from '../../enums/payment-method.enum';

/**
 * Seletor de método de pagamento.
 *
 * Construído por inteiro nesta fase mas ainda não renderizado: a página de
 * confirmação só o mostra quando `paymentsEnabled` estiver ligada. Quando o
 * provedor entrar, basta ligar a flag — não há TODO nem parágrafo fixo a
 * substituir.
 */
@Component({
  selector: 'app-payment-method-picker',
  imports: [],
  templateUrl: './payment-method-picker.component.html',
  styleUrl: './payment-method-picker.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PaymentMethodPickerComponent),
      multi: true,
    },
  ],
})
export class PaymentMethodPickerComponent implements ControlValueAccessor {
  /** Os métodos disponíveis mudam com a moeda — Pix só existe em BRL. */
  readonly currency = input<Currency>(Currency.EUR);
  readonly labelId = input<string | null>(null);

  readonly selected = signal<PaymentMethod | null>(null);
  readonly disabled = signal(false);

  private onChange: (value: PaymentMethod | null) => void = () => {};
  private onTouched: () => void = () => {};

  get options(): PaymentMethodOption[] {
    return paymentMethodsFor(this.currency());
  }

  select(method: PaymentMethod): void {
    if (this.disabled() || method === this.selected()) return;
    this.selected.set(method);
    this.onChange(method);
    this.onTouched();
  }

  writeValue(value: PaymentMethod | null): void {
    this.selected.set(value ?? null);
  }

  registerOnChange(fn: (value: PaymentMethod | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}
