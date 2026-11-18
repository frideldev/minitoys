import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuderComponent } from './menuder.component';

describe('MenuderComponent', () => {
  let component: MenuderComponent;
  let fixture: ComponentFixture<MenuderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
