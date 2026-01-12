import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MindfulnessComponent } from './mindfulness.component';

describe('MindfulnessComponent', () => {
  let component: MindfulnessComponent;
  let fixture: ComponentFixture<MindfulnessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MindfulnessComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MindfulnessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
