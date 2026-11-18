import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockbajoComponent } from './stockbajo.component';

describe('StockbajoComponent', () => {
  let component: StockbajoComponent;
  let fixture: ComponentFixture<StockbajoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockbajoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StockbajoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
