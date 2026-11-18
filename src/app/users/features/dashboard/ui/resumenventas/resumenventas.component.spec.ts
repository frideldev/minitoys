import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { ResumenventasComponent } from './resumenventas.component';

describe('ResumenventasComponent', () => {
  let component: ResumenventasComponent;
  let fixture: ComponentFixture<ResumenventasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResumenventasComponent, HttpClientTestingModule],
      providers: [provideRouter([])],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .overrideComponent(ResumenventasComponent, { set: { template: '<div></div>', imports: [] } })
    .compileComponents();

    fixture = TestBed.createComponent(ResumenventasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
