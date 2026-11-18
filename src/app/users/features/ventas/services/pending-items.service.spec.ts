/**
 * Tests para PendingItemsService
 *
 * Cubre todos los escenarios de conversión de ventas a pending items:
 *   - Lista vacía
 *   - Preventa sin adelanto
 *   - Preventa con adelanto parcial
 *   - Solo ventas completadas (no aparecen como pendientes)
 *   - Mezcla completadas + pendientes
 *   - Prioridades según días pendientes
 *   - Información de cliente (cuando existe y cuando no)
 *   - Formato de fechas
 */

import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { PendingItemsService } from './pending-items.service';
import { ClientesStateService } from '../../../services/clientes-state.service';

// ─── Mock de clientes ─────────────────────────────────────────────────────────

const clientesData = [
  { id: 10, nombre: 'Ana', apellido: 'García', telefono: '71234567', full_name: 'Ana García' },
  { id: 20, nombre: 'Carlos', apellido: 'Pérez', telefono: '76543210', full_name: 'Carlos Pérez' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Crea una fecha de N días atrás como ISO string */
function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function makeVenta(overrides: Record<string, any> = {}): any {
  return {
    id: 1,
    idCliente: 10,
    precioTotal: 100,
    saldo: 0,
    recogido: false,
    fecha: daysAgo(0),
    created_at: daysAgo(0),
    ...overrides,
  };
}

// ─────────────────────────────────────────────────────────────────────────────

describe('PendingItemsService', () => {
  let service: PendingItemsService;
  let clientesStateSig: ReturnType<typeof signal>;

  beforeEach(() => {
    clientesStateSig = signal({ clientes: clientesData, status: 'success', error: null });

    const clientesMock = { state: clientesStateSig };

    TestBed.configureTestingModule({
      providers: [
        PendingItemsService,
        { provide: ClientesStateService, useValue: clientesMock },
      ],
    });

    service = TestBed.inject(PendingItemsService);
  });

  it('debería crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  // ── Lista vacía ──────────────────────────────────────────────────────────
  describe('lista vacía o nula', () => {
    it('debería devolver [] para array vacío', () => {
      expect(service.convertVentasToPendingItems([])).toEqual([]);
    });

    it('debería devolver [] para null', () => {
      expect(service.convertVentasToPendingItems(null as any)).toEqual([]);
    });

    it('debería devolver [] para undefined', () => {
      expect(service.convertVentasToPendingItems(undefined as any)).toEqual([]);
    });
  });

  // ── Solo completadas no aparecen ─────────────────────────────────────────
  describe('ventas completadas — no aparecen en pendientes', () => {
    it('debería filtrar ventas con recogido=true', () => {
      const completada = makeVenta({ id: 1, recogido: true });

      const items = service.convertVentasToPendingItems([completada]);

      expect(items.length).toBe(0);
    });

    it('debería filtrar múltiples completadas', () => {
      const ventas = [
        makeVenta({ id: 1, recogido: true }),
        makeVenta({ id: 2, recogido: true }),
        makeVenta({ id: 3, recogido: true }),
      ];

      expect(service.convertVentasToPendingItems(ventas).length).toBe(0);
    });
  });

  // ── Escenario: preventa sin adelanto ─────────────────────────────────────
  describe('Escenario — preventa sin adelanto', () => {
    it('debería convertir una preventa sin adelanto a PendingItem', () => {
      const venta = makeVenta({ id: 5, idCliente: 10, precioTotal: 80, saldo: 0 });

      const items = service.convertVentasToPendingItems([venta]);

      expect(items.length).toBe(1);
      expect(items[0].id).toBe(5);
      expect(items[0].status).toBe('pending');
      expect(items[0].metadata.preventaId).toBe(5);
    });

    it('debería asignar amount = total cuando saldo es 0', () => {
      const venta = makeVenta({ id: 5, precioTotal: 80, saldo: 0 });

      const items = service.convertVentasToPendingItems([venta]);

      // amount = total - saldo = 80 - 0 = 80
      expect(items[0].amount).toBe(80);
    });

    it('debería incluir info del cliente si existe', () => {
      const venta = makeVenta({ id: 5, idCliente: 10 }); // cliente Ana García

      const items = service.convertVentasToPendingItems([venta]);

      expect(items[0].clientName).toContain('Ana');
    });

    it('debería usar fallback para cliente desconocido', () => {
      const venta = makeVenta({ id: 5, idCliente: 999 }); // cliente inexistente

      const items = service.convertVentasToPendingItems([venta]);

      expect(items[0].clientName).toContain('999');
    });
  });

  // ── Escenario: preventa con adelanto parcial ─────────────────────────────
  describe('Escenario — preventa con adelanto', () => {
    it('debería calcular amount como saldo faltante (total - adelanto)', () => {
      const venta = makeVenta({ id: 6, precioTotal: 200, saldo: 50 });

      const items = service.convertVentasToPendingItems([venta]);

      // amount = total - saldo = 200 - 50 = 150
      expect(items[0].amount).toBe(150);
    });

    it('status debería ser pending aunque tenga adelanto', () => {
      const venta = makeVenta({ id: 6, precioTotal: 200, saldo: 50, recogido: false });

      const items = service.convertVentasToPendingItems([venta]);

      expect(items[0].status).toBe('pending');
    });
  });

  // ── Escenario: mezcla completadas + pendientes ───────────────────────────
  describe('Escenario — mezcla completadas y pendientes', () => {
    it('solo las pendientes deben aparecer en el resultado', () => {
      const ventas = [
        makeVenta({ id: 1, recogido: true }),   // completada → filtrada
        makeVenta({ id: 2, recogido: false }),   // pendiente → incluida
        makeVenta({ id: 3, recogido: true }),    // completada → filtrada
        makeVenta({ id: 4, recogido: false }),   // pendiente → incluida
      ];

      const items = service.convertVentasToPendingItems(ventas);

      expect(items.length).toBe(2);
      expect(items.map(i => i.id)).toEqual([2, 4]);
    });
  });

  // ── Escenario: múltiples pendientes ─────────────────────────────────────
  describe('Escenario — múltiples pendientes', () => {
    it('debería convertir N preventas correctamente', () => {
      const ventas = [
        makeVenta({ id: 10, idCliente: 10, precioTotal: 50 }),
        makeVenta({ id: 11, idCliente: 20, precioTotal: 80 }),
        makeVenta({ id: 12, idCliente: 10, precioTotal: 120, saldo: 40 }),
      ];

      const items = service.convertVentasToPendingItems(ventas);

      expect(items.length).toBe(3);
      expect(items[0].amount).toBe(50);   // 50 - 0
      expect(items[1].amount).toBe(80);   // 80 - 0
      expect(items[2].amount).toBe(80);   // 120 - 40
    });

    it('debería usar id del cliente correcto para cada preventa', () => {
      const ventas = [
        makeVenta({ id: 10, idCliente: 10 }),  // Ana García
        makeVenta({ id: 11, idCliente: 20 }),  // Carlos Pérez
      ];

      const items = service.convertVentasToPendingItems(ventas);

      expect(items[0].clientName).toContain('Ana');
      expect(items[1].clientName).toContain('Carlos');
    });
  });

  // ── Prioridades por días pendientes ─────────────────────────────────────
  describe('prioridades según días pendientes', () => {
    it('debería asignar prioridad low para preventa de hoy', () => {
      const venta = makeVenta({ fecha: daysAgo(0) });

      const items = service.convertVentasToPendingItems([venta]);

      expect(items[0].priority).toBe('low');
    });

    it('debería asignar prioridad medium para preventa de 2-3 días', () => {
      const venta = makeVenta({ fecha: daysAgo(2) });

      const items = service.convertVentasToPendingItems([venta]);

      expect(items[0].priority).toBe('medium');
    });

    it('debería asignar prioridad high para preventa de 4-7 días', () => {
      const venta = makeVenta({ fecha: daysAgo(4) });

      const items = service.convertVentasToPendingItems([venta]);

      expect(items[0].priority).toBe('high');
    });

    it('debería asignar prioridad urgent para preventa de más de 7 días', () => {
      const venta = makeVenta({ fecha: daysAgo(8) });

      const items = service.convertVentasToPendingItems([venta]);

      expect(items[0].priority).toBe('urgent');
    });

    it('debería usar created_at si fecha no está disponible', () => {
      const venta = makeVenta({ fecha: undefined, created_at: daysAgo(9) });

      const items = service.convertVentasToPendingItems([venta]);

      expect(items[0].priority).toBe('urgent');
    });
  });

  // ── metadata ─────────────────────────────────────────────────────────────
  describe('metadata de los items', () => {
    it('debería incluir preventaId en metadata', () => {
      const venta = makeVenta({ id: 77 });

      const items = service.convertVentasToPendingItems([venta]);

      expect(items[0].metadata.preventaId).toBe(77);
    });

    it('debería incluir sucursalId en metadata si existe', () => {
      const venta = makeVenta({ id: 77, idSucursal: 3 });

      const items = service.convertVentasToPendingItems([venta]);

      expect(items[0].metadata.sucursalId).toBe(3);
    });

    it('debería incluir datos del cliente en metadata cuando existe', () => {
      const venta = makeVenta({ id: 77, idCliente: 10 });

      const items = service.convertVentasToPendingItems([venta]);

      expect(items[0].metadata.cliente).toBeTruthy();
      expect(items[0].metadata.cliente.nombre).toBe('Ana');
    });

    it('debería tener metadata.cliente null para cliente desconocido', () => {
      const venta = makeVenta({ id: 77, idCliente: 9999 });

      const items = service.convertVentasToPendingItems([venta]);

      expect(items[0].metadata.cliente).toBeNull();
    });
  });
});
