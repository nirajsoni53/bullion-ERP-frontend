import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartyOrderInfoComponent } from './party-order-info.component';

describe('PartyOrderInfoComponent', () => {
  let component: PartyOrderInfoComponent;
  let fixture: ComponentFixture<PartyOrderInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PartyOrderInfoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PartyOrderInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
