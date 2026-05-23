import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartiesHeaderComponent } from './parties-header.component';

describe('PartiesHeaderComponent', () => {
  let component: PartiesHeaderComponent;
  let fixture: ComponentFixture<PartiesHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PartiesHeaderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PartiesHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
