import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { SubCategoriasComponent } from './subcategorias.component';

describe('SubCategoriasComponent', () => {
  let component: SubCategoriasComponent;
  let fixture: ComponentFixture<SubCategoriasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubCategoriasComponent, HttpClientTestingModule],
      providers: [provideRouter([])],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .overrideComponent(SubCategoriasComponent, { set: { template: '<div></div>', imports: [] } })
    .compileComponents();

    fixture = TestBed.createComponent(SubCategoriasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
