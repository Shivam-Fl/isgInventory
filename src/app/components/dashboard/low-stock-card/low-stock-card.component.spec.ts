import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LowStockCardComponent } from './low-stock-card.component';

describe('LowStockCardComponent', () => {
  let component: LowStockCardComponent;
  let fixture: ComponentFixture<LowStockCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LowStockCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LowStockCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
