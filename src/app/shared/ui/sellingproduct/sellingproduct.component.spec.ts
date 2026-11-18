import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SellingproductComponent } from './sellingproduct.component';

describe('SellingproductComponent', () => {
  let component: SellingproductComponent;
  let fixture: ComponentFixture<SellingproductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SellingproductComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SellingproductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
