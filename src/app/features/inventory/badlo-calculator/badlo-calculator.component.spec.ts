import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BadloCalculatorComponent } from './badlo-calculator.component';

describe('BadloCalculatorComponent', () => {
  let component: BadloCalculatorComponent;
  let fixture: ComponentFixture<BadloCalculatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BadloCalculatorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BadloCalculatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
