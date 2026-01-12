import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  forwardRef,
  HostListener,
  inject,
  Input,
  OnInit,
  Renderer2,
  signal,
  ViewChild,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { CountryModel } from '../../models/country.model';
import { BehaviorSubject, tap, debounce, timer } from 'rxjs';
import { Countries } from '../../../../assets/countries';
import { FormService } from '../../../core/services/form.service';
import { FormControlsNames } from '../../enums/form-controls-names.enum';
import { LazyLoadingFlagDirective } from '../../directives/lazy-loading-flag-directive.directive';

@Component({
  selector: 'app-phone-input',
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    LazyLoadingFlagDirective,
    ReactiveFormsModule,
  ],
  templateUrl: './phone-input.component.html',
  styleUrl: './phone-input.component.scss',
})
export class PhoneInputComponent implements OnInit, AfterViewInit {
  countries: CountryModel[] = Countries;
  selectedCountry = signal<CountryModel>(Countries[0]);
  formService = inject(FormService);
  cdr = inject(ChangeDetectorRef);
  @ViewChild('phoneWrapper') phoneWrapper!: ElementRef;
  @ViewChild('countrySelect') countrySelect!: MatSelect;

  @Input() phoneInputConfiguration = {
    controlName: 'Phone',
    title: 'Phone',
    maxLength: 4,
    minLength: 0,
    tipMessages: new Map([['', '']]),
    errorMessages: new Map([['', '']]),
    optional: false,
    focusElement: false,
  };

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement | null;

    if (!input) {
      return;
    }

    this.inputFormatting(input);
    this.updatePhoneNumberInputLength();
  }

  @HostListener('window:resize')
  onResize() {
    if (this.phoneWrapper && this.countrySelect.panelOpen) {
      const width = this.phoneWrapper.nativeElement.offsetWidth;
      document.documentElement.style.setProperty('--panel-width', `${width}px`);
    }
  }

  control: FormControl = new FormControl();
  prefixControl: FormControl = this.formService.onboardingForm.get(
    FormControlsNames.PHONE_PREFIX
  ) as FormControl;
  countrySelectionIsOpen = false;
  isFocusedCountrySelect = false;
  keySubject: BehaviorSubject<string> = new BehaviorSubject<string>('');
  activeIndexCountry = 0;
  isFocused = false;
  areaCode = 0;
  searchTerm = '';

  constructor(private renderer: Renderer2) {
    this.keySubject
      .pipe(
        tap((key) => (this.searchTerm += key)),
        tap(() => {
          // this.filterOptions(this.searchTerm);
        }),
        debounce(() => timer(1500)),
        tap(() => (this.searchTerm = ''))
      )
      .subscribe();

    // this.ColaFormService.currentCountryPhone
    //   .pipe(
    //     tap((country) => {
    //       this.ColaFormService.ColaForm.get('contactDetails.country')?.setValue(
    //         country.GermanName
    //       );
    //     })
    //   )
    //   .subscribe();
    this.control = this.formService.onboardingForm.get(
      FormControlsNames.PHONE
    ) as FormControl;
  }

  ngOnInit(): void {}

  ngAfterViewInit() {
    // Patch the open method to set width BEFORE opening
    const originalOpen = this.countrySelect.open;
    this.countrySelect.open = () => {
      // Set width immediately before opening
      if (this.phoneWrapper) {
        const width = this.phoneWrapper.nativeElement.offsetWidth;
        document.documentElement.style.setProperty(
          '--panel-width',
          `${width}px`
        );
      }
      originalOpen.call(this.countrySelect);
    };
  }
  setPanelWidth() {
    if (!this.phoneWrapper) return;

    const width = this.phoneWrapper.nativeElement.offsetWidth;

    // Use requestAnimationFrame to ensure the overlay is rendered
    requestAnimationFrame(() => {
      // Target all possible elements
      const overlayPane = document.querySelector(
        '.cdk-overlay-pane'
      ) as HTMLElement;
      const panel = document.querySelector('.full-width-panel') as HTMLElement;

      if (overlayPane) {
        overlayPane.style.width = `${width}px !important`;
        overlayPane.style.maxWidth = `${width}px !important`;
      }

      if (panel) {
        panel.style.width = `${width}px !important`;
        panel.style.maxWidth = `${width}px !important`;
        panel.style.minWidth = `${width}px !important`;
      }

      console.log(
        'Applied width:',
        width,
        'to panel:',
        !!panel,
        'to pane:',
        !!overlayPane
      );
    });
  }

  // filterOptions(term: string): void {
  //   if (this.countrySelectionIsOpen) {
  //     for (let i = 0; i < this.countries.length; i++) {
  //       if (this.countries[i].name.startsWith(term)) {
  //         if (!this.isFocused) {
  //           this.isFocused = true;
  //         }
  //         if (this.activeIndexCountry < this.countries.length - 1) {
  //           this.activeIndexCountry++;
  //         }
  //         this.scrollToItem(i);
  //         break;
  //       }
  //     }
  //   }
  // }

  clearInput(): void {
    this.control.setValue('');
  }

  updatePhoneNumberInputLength(): void {
    this.calcMaxLength();
    this.calcMinLength();
  }

  calcMaxLength(): void {
    this.areaCode = this.formService.onboardingForm.get(
      FormControlsNames.PHONE_PREFIX
    )!.value.InternationalAreaCode;
    const lengthAreaCode = this.formService.onboardingForm.get(
      FormControlsNames.PHONE_PREFIX
    )!.value.LengthOfInternationalAreaCode;
    console.log(this.areaCode, lengthAreaCode);
    if (this.areaCode === 49) {
      this.phoneInputConfiguration.maxLength = 14;
    } else {
      this.phoneInputConfiguration.maxLength = 15 - lengthAreaCode;
    }
    this.cdr.detectChanges();
  }

  calcMinLength(): void {
    this.areaCode = this.formService.onboardingForm.get(
      FormControlsNames.PHONE_PREFIX
    )!.value.InternationalAreaCode;
    const lengthAreaCode = this.formService.onboardingForm.get(
      FormControlsNames.PHONE_PREFIX
    )!.value;
    if (this.areaCode === 49) {
      this.phoneInputConfiguration.minLength = 7;
    }
    if (this.areaCode !== 49 && lengthAreaCode === 3) {
      this.phoneInputConfiguration.minLength = 5;
    }
    if (this.areaCode !== 49 && lengthAreaCode === 4) {
      this.phoneInputConfiguration.minLength = 4;
    }
    if (this.areaCode !== 49 && lengthAreaCode === 5) {
      this.phoneInputConfiguration.minLength = 3;
    }
    if (this.areaCode !== 49 && lengthAreaCode === 6) {
      this.phoneInputConfiguration.minLength = 2;
    }
    if (this.areaCode !== 49 && lengthAreaCode === 8) {
      this.phoneInputConfiguration.minLength = 0;
    }
    this.cdr.detectChanges();
  }

  inputFormatting(input: HTMLInputElement): void {
    let newValue = input.value.replace(/[^0-9]/g, '');
    if (newValue.startsWith('0')) {
      newValue = newValue.substring(1);
    }

    if (
      this.phoneInputConfiguration.maxLength &&
      newValue.length > this.phoneInputConfiguration.maxLength
    ) {
      newValue = newValue.slice(0, this.phoneInputConfiguration.maxLength);
    }

    if (
      this.phoneInputConfiguration.minLength &&
      newValue.length < this.phoneInputConfiguration.minLength
    ) {
      this.control?.setErrors({ minlength: true });
    } else {
      const errors = this.control?.errors;
      if (errors && errors['minLength']) {
        delete errors['minLength'];
        this.control?.setErrors(Object.keys(errors).length ? errors : null);
      }
    }

    if (newValue !== input.value) {
      input.value = newValue;
      input.dispatchEvent(new Event('input'));
    }
  }

  showError(): boolean {
    // return (
    //   (this.formService.isSubmited.value && this.control?.invalid) ||
    //   (this.control?.invalid && this.control?.touched)
    // );
    return false;
  }

  showSuccess(): boolean {
    // return (
    //   (this.formService.isSubmited.value && this.control?.valid) ||
    //   (this.control?.valid && this.control?.touched)
    // );
    return false;
  }

  getTipMessage(): string {
    // if (this.formService.currentCountryPhone.value.name === 'Germany') {
    //   return this.phoneInputConfiguration.tipMessages.get('germany') ?? '';
    // } else {
    //   return this.phoneInputConfiguration.tipMessages.get('nonGermany') ?? '';
    // }
    return 'test';
  }

  getErrorMessage(): string {
    if (this.control?.errors) {
      return (
        this.phoneInputConfiguration.errorMessages.get(
          Object.keys(this.control.errors)[0]
        ) ?? ''
      );
    }
    return '';
  }
}
