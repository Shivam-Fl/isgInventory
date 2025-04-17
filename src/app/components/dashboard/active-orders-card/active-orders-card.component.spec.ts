import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveOrdersCardComponent } from './active-orders-card.component';

describe('ActiveOrdersCardComponent', () => {
  let component: ActiveOrdersCardComponent;
  let fixture: ComponentFixture<ActiveOrdersCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ActiveOrdersCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActiveOrdersCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
