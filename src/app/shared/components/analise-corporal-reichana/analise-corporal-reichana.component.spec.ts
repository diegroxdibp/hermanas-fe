import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnaliseCorporalReichanaComponent } from './analise-corporal-reichana.component';

describe('AnaliseCorporalReichanaComponent', () => {
  let component: AnaliseCorporalReichanaComponent;
  let fixture: ComponentFixture<AnaliseCorporalReichanaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnaliseCorporalReichanaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnaliseCorporalReichanaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
