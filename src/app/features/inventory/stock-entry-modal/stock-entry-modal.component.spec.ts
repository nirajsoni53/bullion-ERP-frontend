import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockEntryModalComponent } from './stock-entry-modal.component';

describe('StockEntryModalComponent', () => {
  let component: StockEntryModalComponent;
  let fixture: ComponentFixture<StockEntryModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StockEntryModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StockEntryModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
