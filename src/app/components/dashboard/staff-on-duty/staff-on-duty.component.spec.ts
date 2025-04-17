import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffOnDutyComponent } from './staff-on-duty.component';

describe('StaffOnDutyComponent', () => {
  let component: StaffOnDutyComponent;
  let fixture: ComponentFixture<StaffOnDutyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StaffOnDutyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StaffOnDutyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
