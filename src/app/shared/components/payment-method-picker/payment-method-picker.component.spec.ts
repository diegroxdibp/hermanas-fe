import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaymentMethodPickerComponent } from './payment-method-picker.component';
import { Currency } from '../../enums/currency.enum';
import { PaymentMethod } from '../../enums/payment-method.enum';

describe('PaymentMethodPickerComponent', () => {
  let fixture: ComponentFixture<PaymentMethodPickerComponent>;
  let component: PaymentMethodPickerComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentMethodPickerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentMethodPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('oferece MB Way em euro e Pix em real', () => {
    fixture.componentRef.setInput('currency', Currency.EUR);
    expect(component.options.map(o => o.value)).toContain(PaymentMethod.MBWAY);
    expect(component.options.map(o => o.value)).not.toContain(PaymentMethod.PIX);

    fixture.componentRef.setInput('currency', Currency.BRL);
    expect(component.options.map(o => o.value)).toContain(PaymentMethod.PIX);
    expect(component.options.map(o => o.value)).not.toContain(PaymentMethod.MBWAY);
  });

  it('emite a escolha através do ControlValueAccessor', () => {
    const changes: (PaymentMethod | null)[] = [];
    component.registerOnChange(v => changes.push(v));

    component.select(PaymentMethod.CARD);

    expect(component.selected()).toBe(PaymentMethod.CARD);
    expect(changes).toEqual([PaymentMethod.CARD]);
  });

  it('não emite de novo quando a escolha não muda', () => {
    const changes: (PaymentMethod | null)[] = [];
    component.select(PaymentMethod.CARD);
    component.registerOnChange(v => changes.push(v));

    component.select(PaymentMethod.CARD);

    expect(changes).toEqual([]);
  });

  it('writeValue reflete o valor do formulário sem emitir', () => {
    const changes: (PaymentMethod | null)[] = [];
    component.registerOnChange(v => changes.push(v));

    component.writeValue(PaymentMethod.BANK_TRANSFER);

    expect(component.selected()).toBe(PaymentMethod.BANK_TRANSFER);
    expect(changes).toEqual([]);
  });

  it('ignora cliques quando desativado', () => {
    const changes: (PaymentMethod | null)[] = [];
    component.registerOnChange(v => changes.push(v));
    component.setDisabledState(true);

    component.select(PaymentMethod.CARD);

    expect(component.selected()).toBeNull();
    expect(changes).toEqual([]);
  });

  it('renderiza uma opção por método disponível', () => {
    fixture.componentRef.setInput('currency', Currency.BRL);
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('.picker-option');
    expect(rows.length).toBe(component.options.length);
  });
});
