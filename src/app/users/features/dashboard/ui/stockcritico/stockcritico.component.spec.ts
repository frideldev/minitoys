import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { StockcriticoComponent } from './stockcritico.component';

describe('StockcriticoComponent', () => {
  let component: StockcriticoComponent;
  let fixture: ComponentFixture<StockcriticoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockcriticoComponent, HttpClientTestingModule],
      providers: [provideRouter([])],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .overrideComponent(StockcriticoComponent, { set: { template: '<div></div>', imports: [] } })
    .compileComponents();

    fixture = TestBed.createComponent(StockcriticoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
