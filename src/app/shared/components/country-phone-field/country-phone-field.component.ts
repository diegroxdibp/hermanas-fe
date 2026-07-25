import { Component, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MaskitoDirective } from '@maskito/angular';
import { MaskitoOptions } from '@maskito/core';
import { CountryModel } from '../../models/country.model';
import { Countries } from '../../../../assets/countries';
import phoneNumberMask from '../../masks/phone-number.mask';

// Phone number input with a clickable, overridable country prefix.
// The prefix mirrors the `country` input (e.g. a "País" selector elsewhere
// on the same form) until the user picks a different prefix directly from
// this component's own dropdown - from that point on it stops following
// `country`, since the two are no longer assumed to be the same thing
// (e.g. living in Portugal but keeping a Brazilian mobile number).
@Component({
  selector: 'app-country-phone-field',
  imports: [ReactiveFormsModule, MaskitoDirective],
  templateUrl: './country-phone-field.component.html',
  styleUrl: './country-phone-field.component.scss',
})
export class CountryPhoneFieldComponent implements OnChanges {
  @Input({ required: true }) country!: CountryModel;
  @Input({ required: true }) phoneControl!: FormControl;
  @Input() placeholder = '000 000 000';
  @Input() inputId = 'phone';

  @Output() readonly prefixCountryChange = new EventEmitter<CountryModel>();

  readonly countries = Countries;
  readonly phoneMask: MaskitoOptions = phoneNumberMask;

  readonly prefixCountry = signal<CountryModel>(Countries[0]);
  readonly dropdownOpen = signal(false);
  private linked = true;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['country'] && this.country && this.linked) {
      this.prefixCountry.set(this.country);
      this.prefixCountryChange.emit(this.country);
    }
  }

  @HostListener('document:mousedown')
  closeDropdown(): void {
    this.dropdownOpen.set(false);
  }

  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.dropdownOpen.update(v => !v);
  }

  selectPrefixCountry(country: CountryModel, event: Event): void {
    event.stopPropagation();
    this.linked = false;
    this.prefixCountry.set(country);
    this.dropdownOpen.set(false);
    this.prefixCountryChange.emit(country);
  }
}
