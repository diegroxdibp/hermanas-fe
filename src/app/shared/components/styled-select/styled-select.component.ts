import { Component, EventEmitter, HostListener, Input, Output, signal } from '@angular/core';

export interface StyledSelectOption {
  value: string;
  label: string;
  meta?: string;
}

// Generic popover-styled select, replacing native <select> for cases where
// we want consistent, custom-styled dropdown UI (and, as a side effect, avoid
// the native-select-plus-*ngFor timing quirk where the bound value doesn't
// visually reflect until options have already been rendered once).
@Component({
  selector: 'app-styled-select',
  imports: [],
  templateUrl: './styled-select.component.html',
  styleUrl: './styled-select.component.scss',
})
export class StyledSelectComponent {
  @Input({ required: true }) options: StyledSelectOption[] = [];
  @Input() value: string | null = null;
  @Input() placeholder = 'Selecione';
  @Input() inputId = '';

  @Output() readonly valueChange = new EventEmitter<string>();

  readonly dropdownOpen = signal(false);

  get selectedOption(): StyledSelectOption | undefined {
    return this.options.find(o => o.value === this.value);
  }

  @HostListener('document:mousedown')
  closeDropdown(): void {
    this.dropdownOpen.set(false);
  }

  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.dropdownOpen.update(v => !v);
  }

  select(option: StyledSelectOption, event: Event): void {
    event.stopPropagation();
    this.value = option.value;
    this.valueChange.emit(option.value);
    this.dropdownOpen.set(false);
  }
}
