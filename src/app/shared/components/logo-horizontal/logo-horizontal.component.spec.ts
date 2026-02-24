import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogoHorizontalComponent } from './logo-horizontal.component';

describe('LogoHorizontalComponent', () => {
  let component: LogoHorizontalComponent;
  let fixture: ComponentFixture<LogoHorizontalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogoHorizontalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LogoHorizontalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
