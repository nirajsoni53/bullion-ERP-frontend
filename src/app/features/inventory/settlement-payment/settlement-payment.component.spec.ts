import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettlementPaymentComponent } from './settlement-payment.component';

describe('SettlementPaymentComponent', () => {
  let component: SettlementPaymentComponent;
  let fixture: ComponentFixture<SettlementPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SettlementPaymentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SettlementPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
