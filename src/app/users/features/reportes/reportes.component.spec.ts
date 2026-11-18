import { TestBed } from '@angular/core/testing';
import { signal, computed, WritableSignal } from '@angular/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ReportesComponent } from './reportes.component';
import { CajaDiariaStateService } from './services/caja-diaria-state.service';
import { FormasPagoStateService } from '../../services/formaspago-state.service';
import { AuthStateService } from '../../../auth/services/auth-state.service';
import { VentaDetallada } from './services/caja-diaria.service';
import { TipoVentaCase } from '../../../shared/ui/pending-list/interfaces/pending-item.interface';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Crea una VentaDetallada mínima. Por defecto usa la fecha de HOY para que los
 *  filtros por fecha funcionen correctamente en los tests de computed signals. */
function makeVenta(overrides: Partial<VentaDetallada> = {}): VentaDetallada {
  return {
    id: 1,
    hora: '10:00',
    cliente: 'Cliente Prueba',
    productos: 'Producto Prueba',
    total: 100,
    precioTotal: 100,
    saldo: 0,
    recogido: false,
    estado: 'pendiente',
    fecha: new Date().toISOString(),
    detalle_venta_productos: [],
    detalle_venta_personalizadas: [],
    ...overrides,
  };
}

describe('ReportesComponent', () => {
  let component: ReportesComponent;
  let ventasSig: WritableSignal<VentaDetallada[]>;
  let cajaCerradaSig: WritableSignal<boolean>;
  let authMock: jasmine.SpyObj<AuthStateService>;
  let cajaMock: any;
  let formasPagoMockRef: any;

  beforeEach(async () => {
    // Individual signals so tests can update them reactively
    ventasSig = signal<VentaDetallada[]>([]);
    cajaCerradaSig = signal(false);

    cajaMock = {
      state: {
        ventas: ventasSig,
        ventasPendientesTodas: computed(() => ventasSig().filter(v => !v.recogido)),
        resumenCaja: signal(null),
        status: signal('success' as const),
        error: signal(null as string | null),
        cierreEnProceso: signal(false),
        reciboHtml: signal(null as string | null),
        reciboLoading: signal(false),
        cajaCerrada: cajaCerradaSig,
        mensajeCierre: signal(null as string | null),
      },
      cargarVentasDelDia: jasmine.createSpy('cargarVentasDelDia'),
      realizarCierreCaja: jasmine.createSpy('realizarCierreCaja'),
    };

    authMock = jasmine.createSpyObj('AuthStateService', [
      'validateUserAndRedirect',
      'getCurrentUser',
    ]);
    authMock.validateUserAndRedirect.and.returnValue(true);
    authMock.getCurrentUser.and.returnValue({
      id: 1, username: 'test', name: 'Test', email: 'test@test.com',
      id_sucursal: 1, id_rol: 1, token: 'tok', token_type: 'Bearer',
    });

    formasPagoMockRef = {
      state: signal({ formasPago: [], loading: false, error: null }),
      refreshData: jasmine.createSpy('refreshData'),
    };

    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: CajaDiariaStateService, useValue: cajaMock },
        { provide: FormasPagoStateService, useValue: formasPagoMockRef },
        { provide: AuthStateService, useValue: authMock },
        { provide: ActivatedRoute, useValue: { snapshot: { params: {} } } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
    .overrideComponent(ReportesComponent, {
      set: { template: '<div></div>', imports: [] },
    })
    .compileComponents();

    const fixture = TestBed.createComponent(ReportesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ── Component Initialization ──────────────────────────────────────────────
  describe('Component Initialization', () => {
    it('should initialize services on ngOnInit', () => {
      component.ngOnInit();

      expect(formasPagoMockRef.refreshData).toHaveBeenCalled();
      expect(cajaMock.cargarVentasDelDia).toHaveBeenCalled();
    });

    it('should have fechaHoy as a non-empty string', () => {
      expect(typeof component.fechaHoy).toBe('string');
      expect(component.fechaHoy.length).toBeGreaterThan(0);
    });
  });

  // ── determinarTipoVenta ───────────────────────────────────────────────────
  describe('determinarTipoVenta', () => {
    it('devuelve venta_completada cuando recogido=true', () => {
      expect(component.determinarTipoVenta(makeVenta({ recogido: true }))).toBe('venta_completada');
    });

    it('devuelve preventa_sin_adelanto cuando recogido=false y saldo=0', () => {
      expect(component.determinarTipoVenta(makeVenta({ recogido: false, saldo: 0 }))).toBe('preventa_sin_adelanto');
    });

    it('devuelve preventa_con_adelanto cuando recogido=false y 0 < saldo < total', () => {
      expect(component.determinarTipoVenta(makeVenta({ recogido: false, precioTotal: 200, saldo: 50 }))).toBe('preventa_con_adelanto');
    });

    it('devuelve desconocido cuando saldo >= total y no está recogido', () => {
      expect(component.determinarTipoVenta(makeVenta({ recogido: false, precioTotal: 100, saldo: 150 }))).toBe('desconocido');
    });

    it('maneja precioTotal y saldo undefined (trata como 0)', () => {
      const v = makeVenta({ recogido: false, precioTotal: undefined as any, saldo: undefined as any });
      expect(component.determinarTipoVenta(v)).toBe('preventa_sin_adelanto');
    });

    it('devuelve venta_completada aunque saldo sea 0 si recogido=true', () => {
      expect(component.determinarTipoVenta(makeVenta({ recogido: true, saldo: 0 }))).toBe('venta_completada');
    });

    it('las ventas con cuadros/marcos siguen clasificándose por saldo, no por tipo de item', () => {
      // El sistema unificado ya no distingue entre productos y cuadros para clasificar el tipo
      const conCuadro = makeVenta({
        recogido: false,
        precioTotal: 300,
        saldo: 100,
        detalle_venta_personalizadas: [{ id: 1 } as any],
        detalle_venta_productos: [],
      });
      expect(component.determinarTipoVenta(conCuadro)).toBe('preventa_con_adelanto');
    });
  });

  // ── getTipoVentaLabel ─────────────────────────────────────────────────────
  describe('getTipoVentaLabel', () => {
    const cases: Array<[TipoVentaCase, string]> = [
      ['venta_completada',      'Completada'],
      ['preventa_sin_adelanto', 'Sin Adelanto'],
      ['preventa_con_adelanto', 'Con Adelanto'],
      ['desconocido',           'Desconocido'],
    ];

    cases.forEach(([tipo, expected]) => {
      it(`devuelve "${expected}" para ${tipo}`, () => {
        expect(component.getTipoVentaLabel(tipo)).toBe(expected);
      });
    });
  });

  // ── getTipoVentaClass ─────────────────────────────────────────────────────
  describe('getTipoVentaClass', () => {
    it('clase verde para venta_completada', () => {
      expect(component.getTipoVentaClass('venta_completada')).toContain('green');
    });

    it('clase amarilla para preventa_sin_adelanto', () => {
      expect(component.getTipoVentaClass('preventa_sin_adelanto')).toContain('yellow');
    });

    it('clase naranja para preventa_con_adelanto', () => {
      expect(component.getTipoVentaClass('preventa_con_adelanto')).toContain('orange');
    });

    it('clase gris para desconocido', () => {
      expect(component.getTipoVentaClass('desconocido')).toContain('gray');
    });
  });

  // ── getTipoVentaIcon ──────────────────────────────────────────────────────
  describe('getTipoVentaIcon', () => {
    it('icono check para venta_completada', () => {
      expect(component.getTipoVentaIcon('venta_completada')).toContain('check');
    });

    it('icono clock para preventa_sin_adelanto', () => {
      expect(component.getTipoVentaIcon('preventa_sin_adelanto')).toContain('clock');
    });

    it('icono coins para preventa_con_adelanto', () => {
      expect(component.getTipoVentaIcon('preventa_con_adelanto')).toContain('coins');
    });

    it('icono question para desconocido', () => {
      expect(component.getTipoVentaIcon('desconocido')).toContain('question');
    });
  });

  // ── formatearTotal ────────────────────────────────────────────────────────
  describe('formatearTotal', () => {
    it('formatea número entero', () => {
      expect(component.formatearTotal(100)).toBe('Bs 100.00');
    });

    it('formatea decimal con 2 cifras', () => {
      expect(component.formatearTotal(150.50)).toBe('Bs 150.50');
    });

    it('formatea 0', () => {
      expect(component.formatearTotal(0)).toBe('Bs 0.00');
    });

    it('redondea más de 2 decimales', () => {
      expect(component.formatearTotal(10.999)).toBe('Bs 11.00');
    });
  });

  // ── formatearFecha ────────────────────────────────────────────────────────
  describe('formatearFecha', () => {
    it('formatea fecha ISO válida en dd/mm/yyyy', () => {
      expect(component.formatearFecha('2025-10-03T14:30:00Z')).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it('devuelve "Sin fecha" para string vacío', () => {
      expect(component.formatearFecha('')).toBe('Sin fecha');
    });

    it('devuelve "Fecha inválida" para string inválido', () => {
      expect(component.formatearFecha('invalid-date')).toBe('Fecha inválida');
    });
  });

  // ── Computed signals ──────────────────────────────────────────────────────
  describe('ventasCompletadasDelDia (computed)', () => {
    it('devuelve solo las ventas recogidas de hoy', () => {
      ventasSig.set([
        makeVenta({ recogido: true, precioTotal: 150, estado: 'completado' }),
        makeVenta({ recogido: false, precioTotal: 80 }),
      ]);

      const result = component.ventasCompletadasDelDia();
      expect(result.length).toBe(1);
      expect(result[0].precioTotal).toBe(150);
    });

    it('excluye ventas completadas de días anteriores', () => {
      const ayer = new Date();
      ayer.setDate(ayer.getDate() - 1);
      ventasSig.set([makeVenta({ recogido: true, fecha: ayer.toISOString() })]);

      expect(component.ventasCompletadasDelDia().length).toBe(0);
    });

    it('devuelve [] cuando no hay ventas', () => {
      ventasSig.set([]);
      expect(component.ventasCompletadasDelDia().length).toBe(0);
    });
  });

  describe('ventasPendientes (computed)', () => {
    it('devuelve solo las ventas no recogidas (sin filtro de fecha)', () => {
      const haceDias = new Date();
      haceDias.setDate(haceDias.getDate() - 5);

      ventasSig.set([
        makeVenta({ recogido: true }),
        makeVenta({ recogido: false }),
        makeVenta({ recogido: false, fecha: haceDias.toISOString() }),
      ]);

      expect(component.ventasPendientes().length).toBe(2);
    });

    it('devuelve [] si todas están completadas', () => {
      ventasSig.set([makeVenta({ recogido: true }), makeVenta({ recogido: true })]);
      expect(component.ventasPendientes().length).toBe(0);
    });
  });

  // ── estadisticasPorCasosVenta ─────────────────────────────────────────────
  describe('estadisticasPorCasosVenta', () => {
    it('retorna exactamente 3 cards', () => {
      ventasSig.set([]);
      expect(component.estadisticasPorCasosVenta.length).toBe(3);
    });

    it('los tipos son: venta_completada, preventa_con_adelanto, preventa_sin_adelanto', () => {
      ventasSig.set([]);
      const tipos = component.estadisticasPorCasosVenta.map(e => e.tipo);
      expect(tipos).toContain('venta_completada');
      expect(tipos).toContain('preventa_con_adelanto');
      expect(tipos).toContain('preventa_sin_adelanto');
    });

    it('card Completadas cuenta y suma correctamente las ventas de hoy', () => {
      ventasSig.set([
        makeVenta({ recogido: true, precioTotal: 150, estado: 'completado' }),
        makeVenta({ recogido: true, precioTotal: 200, estado: 'completado' }),
        makeVenta({ recogido: false, precioTotal: 50 }),
      ]);

      const card = component.estadisticasPorCasosVenta.find(e => e.tipo === 'venta_completada')!;
      expect(card.cantidad).toBe(2);
      expect(card.total).toBe(350);
    });

    it('card Sin Adelanto cuenta pendientes con saldo=0', () => {
      ventasSig.set([
        makeVenta({ recogido: false, precioTotal: 80, saldo: 0 }),
        makeVenta({ recogido: false, precioTotal: 60, saldo: 0 }),
        makeVenta({ recogido: false, precioTotal: 200, saldo: 50 }),  // con adelanto
      ]);

      const card = component.estadisticasPorCasosVenta.find(e => e.tipo === 'preventa_sin_adelanto')!;
      expect(card.cantidad).toBe(2);
    });

    it('card Con Adelanto suma los adelantos recibidos (campo saldo)', () => {
      ventasSig.set([
        makeVenta({ recogido: false, precioTotal: 200, saldo: 50 }),
        makeVenta({ recogido: false, precioTotal: 150, saldo: 30 }),
      ]);

      const card = component.estadisticasPorCasosVenta.find(e => e.tipo === 'preventa_con_adelanto')!;
      expect(card.cantidad).toBe(2);
      expect(card.total).toBe(80);
    });

    it('todos los conteos son 0 cuando no hay ventas', () => {
      ventasSig.set([]);
      component.estadisticasPorCasosVenta.forEach(card => {
        expect(card.cantidad).toBe(0);
      });
    });
  });

  // ── Modal de cierre ───────────────────────────────────────────────────────
  describe('Modal de cierre de caja', () => {
    it('abrirModalCierre abre el modal si la caja no está cerrada', () => {
      cajaCerradaSig.set(false);
      component.abrirModalCierre();
      expect(component.mostrarModalCierre()).toBeTrue();
    });

    it('abrirModalCierre no abre el modal si el usuario no está autorizado', () => {
      authMock.validateUserAndRedirect.and.returnValue(false);
      component.abrirModalCierre();
      expect(component.mostrarModalCierre()).toBeFalse();
    });

    it('cancelarCierre cierra el modal y limpia observaciones', () => {
      component.mostrarModalCierre.set(true);
      component.observacionesCierre.set('Nota de prueba');
      component.cancelarCierre();
      expect(component.mostrarModalCierre()).toBeFalse();
      expect(component.observacionesCierre()).toBe('');
    });

    it('confirmarCierreCaja llama al servicio y cierra el modal', () => {
      component.observacionesCierre.set('Cierre del turno');
      component.confirmarCierreCaja();
      expect(cajaMock.realizarCierreCaja).toHaveBeenCalled();
      expect(component.mostrarModalCierre()).toBeFalse();
    });
  });

  // ── Guard: caja cerrada ───────────────────────────────────────────────────
  describe('Guard — caja ya cerrada', () => {
    it('abrirModalCierre muestra alerta y NO abre el modal si la caja está cerrada', () => {
      cajaCerradaSig.set(true);
      spyOn(window, 'alert');
      component.abrirModalCierre();
      expect(window.alert).toHaveBeenCalled();
      expect(component.mostrarModalCierre()).toBeFalse();
    });

    it('isCajaCerrada refleja el estado de la señal cajaCerrada', () => {
      cajaCerradaSig.set(false);
      expect(component.isCajaCerrada).toBeFalse();
      cajaCerradaSig.set(true);
      expect(component.isCajaCerrada).toBeTrue();
    });

    it('puedeRealizarModificaciones es false cuando la caja está cerrada', () => {
      cajaCerradaSig.set(true);
      expect(component.puedeRealizarModificaciones).toBeFalse();
    });

    it('puedeRealizarModificaciones es true cuando la caja está abierta', () => {
      cajaCerradaSig.set(false);
      expect(component.puedeRealizarModificaciones).toBeTrue();
    });
  });

  // ── Visor de recibo ───────────────────────────────────────────────────────
  describe('Visor de recibo', () => {
    it('verRecibo abre el visor con el ID de la venta', () => {
      const venta = makeVenta({ id: 42, recogido: true });
      ventasSig.set([venta]);

      component.verRecibo(venta);

      expect(component.mostrarVisorRecibo()).toBeTrue();
      expect(component.ventaIdActual()).toBe(42);
    });

    it('verRecibo genera un ID temporal si la venta no tiene ID', () => {
      const ventaSinId = makeVenta({ recogido: true });
      delete (ventaSinId as any).id;
      ventasSig.set([ventaSinId]);

      component.verRecibo(ventaSinId);

      expect(component.ventaIdActual()).toBeGreaterThan(0);
    });

    it('cerrarVisorRecibo limpia el estado del visor', () => {
      component.mostrarVisorRecibo.set(true);
      component.ventaIdActual.set(99);

      component.cerrarVisorRecibo();

      expect(component.mostrarVisorRecibo()).toBeFalse();
      expect(component.ventaIdActual()).toBeNull();
    });

    it('verRecibo no abre el visor si el usuario no está autorizado', () => {
      authMock.validateUserAndRedirect.and.returnValue(false);
      component.verRecibo(makeVenta({ id: 5 }));
      expect(component.mostrarVisorRecibo()).toBeFalse();
    });
  });

  // ── Escenario integrado ───────────────────────────────────────────────────
  describe('Escenario integrado — día de ventas completo', () => {
    beforeEach(() => {
      ventasSig.set([
        makeVenta({ id: 1, recogido: true,  precioTotal: 150, estado: 'completado' }),
        makeVenta({ id: 2, recogido: true,  precioTotal: 200, estado: 'completado' }),
        makeVenta({ id: 3, recogido: false, precioTotal: 80,  saldo: 0 }),
        makeVenta({ id: 4, recogido: false, precioTotal: 60,  saldo: 0 }),
        makeVenta({ id: 5, recogido: false, precioTotal: 300, saldo: 100 }),
      ]);
    });

    it('ventasCompletadasDelDia: 2 ventas', () => {
      expect(component.ventasCompletadasDelDia().length).toBe(2);
    });

    it('ventasPendientes: 3 ventas', () => {
      expect(component.ventasPendientes().length).toBe(3);
    });

    it('estadísticas reflejan la distribución correcta', () => {
      const stats = component.estadisticasPorCasosVenta;
      const completadas   = stats.find(s => s.tipo === 'venta_completada')!;
      const sinAdelanto   = stats.find(s => s.tipo === 'preventa_sin_adelanto')!;
      const conAdelanto   = stats.find(s => s.tipo === 'preventa_con_adelanto')!;

      expect(completadas.cantidad).toBe(2);
      expect(completadas.total).toBe(350);

      expect(sinAdelanto.cantidad).toBe(2);

      expect(conAdelanto.cantidad).toBe(1);
      expect(conAdelanto.total).toBe(100);
    });

    it('determinarTipoVenta clasifica correctamente cada venta del escenario', () => {
      const [c1, c2, p1, p2, pa] = ventasSig();
      expect(component.determinarTipoVenta(c1)).toBe('venta_completada');
      expect(component.determinarTipoVenta(c2)).toBe('venta_completada');
      expect(component.determinarTipoVenta(p1)).toBe('preventa_sin_adelanto');
      expect(component.determinarTipoVenta(p2)).toBe('preventa_sin_adelanto');
      expect(component.determinarTipoVenta(pa)).toBe('preventa_con_adelanto');
    });
  });
});
