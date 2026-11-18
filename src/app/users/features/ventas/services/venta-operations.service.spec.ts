import { TestBed } from '@angular/core/testing';
import { VentaOperationsService } from './venta-operations.service';
import { VentaAdapterService, TipoVenta } from './venta-adapter.service';
import { VentasStateService } from './ventas-state.service';
import { ItemVenta } from '../interfaces/item-venta.interface';
import { signal, WritableSignal } from '@angular/core';

// ─── Shared helpers ───────────────────────────────────────────────────────────

function makeStateSignal(init?: Partial<{
  currentPreventa: any; selectedVenta: any;
  error: string | null; loading: boolean;
  ventas: any[]; status: 'idle' | 'loading' | 'success' | 'error';
}>) {
  return signal({ currentPreventa: null as any, selectedVenta: null, error: null as string | null,
    loading: false, ventas: [] as any[], status: 'idle' as const, ...init });
}

function buildSpies(stateSignal: WritableSignal<any>) {
  const adapterSpy = jasmine.createSpyObj<VentaAdapterService>('VentaAdapterService',
    ['prepararVentaProductos', 'determinarParametrosVenta']);
  const stateSpy = jasmine.createSpyObj<VentasStateService>('VentasStateService',
    ['createPreventa', 'completarVenta', 'cancelarVenta', 'getVentaCompleta', 'refreshData', 'clearCurrentPreventa'],
    { state: stateSignal as any });
  return { adapterSpy, stateSpy };
}

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const item: ItemVenta = { id: 1, descripcion: 'Foto 10x15', cantidad: 2, precioUnitario: 3.50, subtotal: 7.00 };

const prepProductos = {
  isValid: true,
  parametrosVenta: { pago: 0, entregado: false, saldo: 0, recogido: false, idFormaPago: 1 },
  tipoVenta: 'preventa_sin_adelanto' as TipoVenta,
  detalles: [{ idProducto: 1, cantidad: 2 }]
};

// ─────────────────────────────────────────────────────────────────────────────
// Main suite
// ─────────────────────────────────────────────────────────────────────────────
describe('VentaOperationsService', () => {
  let service: VentaOperationsService;
  let adapterMock: jasmine.SpyObj<VentaAdapterService>;
  let stateMock: jasmine.SpyObj<VentasStateService>;
  let sig: WritableSignal<any>;

  // Helper used by most tests: createPreventa delivers {venta:{id:123}} after 200ms
  const defaultPreventa = { venta: { id: 123 } };

  beforeEach(() => {
    sig = makeStateSignal();
    const { adapterSpy, stateSpy } = buildSpies(sig);
    stateSpy.createPreventa.and.callFake(() => {
      setTimeout(() => sig.update((s: any) => ({ ...s, currentPreventa: defaultPreventa })), 200);
    });

    TestBed.configureTestingModule({
      providers: [
        VentaOperationsService,
        { provide: VentaAdapterService, useValue: adapterSpy },
        { provide: VentasStateService, useValue: stateSpy }
      ]
    });

    service   = TestBed.inject(VentaOperationsService);
    adapterMock = TestBed.inject(VentaAdapterService) as jasmine.SpyObj<VentaAdapterService>;
    stateMock   = TestBed.inject(VentasStateService) as jasmine.SpyObj<VentasStateService>;
  });

  it('should be created', () => expect(service).toBeTruthy());

  // ── crearVentaUnificada ────────────────────────────────────────────────────
  describe('crearVentaUnificada', () => {
    it('should create venta unificada successfully', async () => {
      adapterMock.prepararVentaProductos.and.returnValue(prepProductos);

      const result = await service.crearVentaUnificada([item], 1, 1, 1, 1, 7.00, 0);

      // PriceUtils.toApi converts Bs → centavos: 7.00 → 700, 0 → 0
      expect(adapterMock.prepararVentaProductos).toHaveBeenCalledWith([item], 1, 1, 0, 700);
      expect(stateMock.createPreventa).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.preventaId).toBe(123);
      expect(result.tipoVenta).toBe('preventa_sin_adelanto');
    });

    it('should apply venta directa override', async () => {
      adapterMock.prepararVentaProductos.and.returnValue(prepProductos);
      adapterMock.determinarParametrosVenta.and.returnValue(
        { pago: 0, entregado: true, saldo: 0, recogido: true, idFormaPago: 1 });

      const result = await service.crearVentaUnificada([item], 1, 1, 1, 1, 7.00, 0, true);

      expect(adapterMock.determinarParametrosVenta).toHaveBeenCalledWith('directa', 700, 0, 1);
      expect(result.success).toBe(true);
      expect(result.tipoVenta).toBe('directa');
    });

    it('should handle invalid preparation', async () => {
      adapterMock.prepararVentaProductos.and.returnValue({ isValid: false, error: 'Error de validación' });

      const result = await service.crearVentaUnificada([item], 1, 1, 1, 1, 7.00, 0);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Error de validación');
    });
  });

  // ── completarVenta ─────────────────────────────────────────────────────────
  describe('completarVenta', () => {
    it('should complete venta successfully', async () => {
      const result = await service.completarVenta(123, 2);

      expect(stateMock.completarVenta).toHaveBeenCalledWith(123, 2);
      expect(result.success).toBe(true);
      expect(result.ventaId).toBe(123);
    });

    it('should detect completion error from state', async () => {
      // Deliver a new error via the spy after dispatch
      stateMock.completarVenta.and.callFake(() => {
        setTimeout(() => sig.update((s: any) => ({ ...s, error: 'Preventa no encontrada' })), 200);
      });

      const result = await service.completarVenta(999, 1);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Preventa no encontrada');
    });
  });

  // ── cancelarVenta ──────────────────────────────────────────────────────────
  describe('cancelarVenta', () => {
    it('should cancel venta successfully', async () => {
      const result = await service.cancelarVenta(123);

      expect(stateMock.cancelarVenta).toHaveBeenCalledWith(123);
      expect(result.success).toBe(true);
    });

    it('should detect cancellation error from state', async () => {
      stateMock.cancelarVenta.and.callFake(() => {
        setTimeout(() => sig.update((s: any) => ({ ...s, error: 'No se puede cancelar' })), 200);
      });

      const result = await service.cancelarVenta(123);

      expect(result.success).toBe(false);
      expect(result.error).toBe('No se puede cancelar');
    });
  });

  // ── cargarVentaCompleta ────────────────────────────────────────────────────
  describe('cargarVentaCompleta', () => {
    it('should load venta completa successfully', async () => {
      stateMock.getVentaCompleta.and.callFake(() => {
        setTimeout(() => sig.update((s: any) => ({ ...s, selectedVenta: { id: 123 } })), 200);
      });

      const result = await service.cargarVentaCompleta(123);

      expect(stateMock.getVentaCompleta).toHaveBeenCalledWith(123);
      expect(result.success).toBe(true);
    });

    it('should detect loading error from state', async () => {
      stateMock.getVentaCompleta.and.callFake(() => {
        setTimeout(() => sig.update((s: any) => ({ ...s, error: 'Venta no encontrada' })), 200);
      });

      const result = await service.cargarVentaCompleta(999);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Venta no encontrada');
    });
  });

  // ── crearYCompletarVenta ───────────────────────────────────────────────────
  describe('crearYCompletarVenta', () => {
    it('should create and complete venta in one step', async () => {
      // crearYCompletarVenta waits 1500ms then calls completarVenta which polls up to ~4s.
      // Total ~5.5s; increase timeout accordingly.
      const result = await service.crearYCompletarVenta([item], 1, 1, 1, 1);

      expect(stateMock.createPreventa).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.ventaId).toBe(123);
    }, 10000); // explicit timeout to cover 1500ms wait + completarVenta poll (~4s)

    it('should handle creation failure (no preventa in state)', async () => {
      // createPreventa spy delivers an error but no preventa
      stateMock.createPreventa.and.callFake(() => {
        setTimeout(() => sig.update((s: any) => ({
          ...s, currentPreventa: null, error: 'Error al crear venta'
        })), 200);
      });

      const result = await service.crearYCompletarVenta([item], 1, 1, 1, 1);

      expect(result.success).toBe(false);
    }, 10000);
  });

  // ── createPreventa (Legacy) ────────────────────────────────────────────────
  describe('createPreventa (Legacy)', () => {
    it('should create preventa using legacy method', async () => {
      const result = await service.createPreventa([item], 1, 1, 1, 1, 7.00, 3.50);

      expect(stateMock.createPreventa).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.preventaId).toBe(123);
    });
  });

  // ── refreshData ────────────────────────────────────────────────────────────
  describe('refreshData', () => {
    it('should delegate to state service', () => {
      service.refreshData();
      expect(stateMock.refreshData).toHaveBeenCalled();
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// REGRESSION – consecutive registrations must return DISTINCT IDs
//
// Bug description
// ───────────────
// The poll in crearVentaMarco / crearVentaUnificada checked:
//
//   if (preventa) { resolve(preventa.id) }
//
// Without verifying that `preventa` was NEWER than the value captured before
// the dispatch.  On every 2nd registration the `of({currentPreventa: null})`
// null-reset emitted by the signalSlice concat was sometimes not yet applied
// when the first poll fired at +500 ms, so the poll saw the PREVIOUS sale's
// currentPreventa and resolved immediately with the wrong ID.
//
// This caused the PDF URL to reference the prior sale's code (e.g. sale #443
// opened the PDF for #442, sale #445 opened the PDF for #444, etc).
//
// Fix applied in venta-operations.service.ts
// ──────────────────────────────────────────
//   crearVentaMarco     →  if (preventa && preventa !== preventaAnteriorMarco)
//   crearVentaUnificada →  if (preventa && preventa !== preventaAnterior)
//
// Test strategy
// ─────────────
// The WritableSignal for state starts holding the previous sale's preventa.
// The spy delivers the NEW preventa 600 ms after dispatch — AFTER the first
// poll tick at 500 ms.  Without the fix the first poll would resolve with the
// stale ID; with the fix it waits for a new object reference.
// ─────────────────────────────────────────────────────────────────────────────
describe('VentaOperationsService – consecutive registration regression', () => {
  let service: VentaOperationsService;
  let sig: WritableSignal<any>;
  let stateSpy: jasmine.SpyObj<VentasStateService>;

  const makeSale = (id: number) => ({
    id, pago: 0, entregado: false, saldo: 0,
    idCliente: 1, idSucursal: 1, idUsuario: 1, idFormaPago: 1,
    precioTotal: 100, recogido: false, created_at: ''
  });

  beforeEach(() => {
    sig = makeStateSignal();
    const { adapterSpy, stateSpy: sp } = buildSpies(sig);
    adapterSpy.prepararVentaProductos.and.returnValue(prepProductos);
    stateSpy = sp;

    TestBed.configureTestingModule({
      providers: [
        VentaOperationsService,
        { provide: VentaAdapterService, useValue: adapterSpy },
        { provide: VentasStateService, useValue: stateSpy }
      ]
    });

    service = TestBed.inject(VentaOperationsService);
  });

  // Convenience: schedule a sale to arrive in the signal after `delay` ms
  function scheduleNextSale(id: number, delay: number) {
    const sale = makeSale(id);
    stateSpy.createPreventa.and.callFake(() => {
      setTimeout(() => sig.update((s: any) => ({ ...s, currentPreventa: sale })), delay);
    });
  }

  it('crearVentaUnificada: 2nd registration must NOT reuse 1st sale ID (race condition)', async () => {
    scheduleNextSale(444, 200);
    const r1 = await service.crearVentaUnificada([item], 1, 1, 1, 1, 7, 0);
    expect(r1.success).toBe(true);
    expect(r1.preventaId).toBe(444);

    // State still holds sale 444 – slow API simulates race
    scheduleNextSale(445, 600);
    const r2 = await service.crearVentaUnificada([item], 1, 1, 1, 1, 7, 0);
    expect(r2.success).toBe(true);
    expect(r2.preventaId).withContext('must be 445, not stale 444').toBe(445);
  });
});
