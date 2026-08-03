import { Component, input, output } from '@angular/core';
import { CURRENCIES, CURRENCY_META, Currency } from '../../enums/currency.enum';

@Component({
  selector: 'app-currency-toggle',
  imports: [],
  templateUrl: './currency-toggle.component.html',
  styleUrl: './currency-toggle.component.scss',
})
export class CurrencyToggleComponent {
  readonly value = input<Currency | null>(null);
  readonly labelId = input<string | null>(null);
  readonly valueChange = output<Currency>();

  readonly currencies = CURRENCIES;
  readonly meta = CURRENCY_META;

  select(currency: Currency): void {
    if (currency !== this.value()) {
      this.valueChange.emit(currency);
    }
  }
}
