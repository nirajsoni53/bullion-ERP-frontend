import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveSummaryComponent } from './live-summary.component';

describe('LiveSummaryComponent', () => {
  let component: LiveSummaryComponent;
  let fixture: ComponentFixture<LiveSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LiveSummaryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LiveSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
