import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeeksalesComponent } from './weeksales.component';

describe('WeeksalesComponent', () => {
  let component: WeeksalesComponent;
  let fixture: ComponentFixture<WeeksalesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeeksalesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WeeksalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
