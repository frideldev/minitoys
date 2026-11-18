import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { ReporteanteriorComponent } from './reporteanterior.component';
import { CierreCajaService } from './services/cierre-caja.service';

describe('ReporteanteriorComponent', () => {
  let component: ReporteanteriorComponent;
  let fixture: ComponentFixture<ReporteanteriorComponent>;

  const cierreCajaServiceMock = {
    getTodosCierresParaDeteccion: () => of([]),
    getCierresCaja: () => of({ data: [], meta: { total: 0, per_page: 10, current_page: 1, last_page: 1 } }),
    getMesesDisponibles: () => [],
    getMesActual: () => '',
    descargarPDF: () => {},
    descargarPDFMensual: () => {}
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReporteanteriorComponent, HttpClientTestingModule],
      providers: [
        provideRouter([]),
        { provide: CierreCajaService, useValue: cierreCajaServiceMock }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .overrideComponent(ReporteanteriorComponent, { set: { template: '<div></div>', imports: [] } })
    .compileComponents();

    fixture = TestBed.createComponent(ReporteanteriorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
