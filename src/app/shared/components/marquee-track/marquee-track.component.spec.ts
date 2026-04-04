import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarqueeTrackComponent } from './marquee-track.component';

describe('MarqueeTrackComponent', () => {
  let component: MarqueeTrackComponent;
  let fixture: ComponentFixture<MarqueeTrackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarqueeTrackComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarqueeTrackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
