import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SomaticExperienceComponent } from './somatic-experience.component';

describe('SomaticExperienceComponent', () => {
  let component: SomaticExperienceComponent;
  let fixture: ComponentFixture<SomaticExperienceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SomaticExperienceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SomaticExperienceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
