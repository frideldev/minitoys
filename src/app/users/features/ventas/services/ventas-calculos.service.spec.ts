/**
 * Tests para VentasCalculosService
 *
 * Cubre todos los cálculos de estadísticas de ventas:
 *   - calcularEstadisticas: métricas globales
 *   - calcularIngresosTotales
 *   - calcularIngresosCompletados
 *   - calcularSaldosPendientes
 *   - contarProductosVendidos
 *   - contarCuadrosPersonalizados
 *   - obtenerVentasDelDia / obtenerVentasDelMes
 *   - Casos extremos: arrays vacíos, valores nulos
 */

import { TestBed } from '@angular/core/testing';
import { VentasCalculosService } from './ventas-calculos.service';
import { Venta } from '../interfaces/venta.interface';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeVenta(overrides: Partial<Venta> = {}): Venta {
  return {
    id: 1,
    pago: 0,
    entregado: false,
    saldo: 0,
    idCliente: 1,
    idSucursal: 1,
    idUsuario: 1,
    idFormaPago: 1,
    precioTotal: 100,
    saldoFalante: 100,
    recogido: false,
    fecha: new Date().toISOString(),
    created_at: new Date().toISOString(),
    detalle_venta_productos: [],
    detalle_venta_personalizadas: [],
    ...overrides,
  } as Venta;
}

/** Crea una fecha de N días atrás */
function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

/** Crea una fecha de N meses atrás */
function monthsAgo(months: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  return d.toISOString();
}

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const ventaCompletada = makeVenta({ id: 1, recogido: true,  precioTotal: 150, saldoFalante: 0 });
const ventaPendiente1 = makeVenta({ id: 2, recogido: false, precioTotal: 80,  saldoFalante: 80 });
const ventaPendiente2 = makeVenta({ id: 3, recogido: false, precioTotal: 60,  saldoFalante: 30, saldo: 30 });
const ventaCompletada2 = makeVenta({ id: 4, recogido: true, precioTotal: 200, saldoFalante: 0 });

// Venta con productos (3 unidades de id=1, 2 unidades de id=2)
const ventaConProductos = makeVenta({
  id: 5,
  recogido: true,
  precioTotal: 100,
  detalle_venta_productos: [
    { id: 1, cantidad: 3, precio: 10, idVenta: 5, idProducto: 1, id_stock_producto: 1, created_at: '', updated_at: '' },
    { id: 2, cantidad: 2, precio: 15, idVenta: 5, idProducto: 2, id_stock_producto: 2, created_at: '', updated_at: '' },
  ],
});

// Venta con cuadros personalizados (2 cuadros)
const ventaConCuadros = makeVenta({
  id: 6,
  recogido: false,
  precioTotal: 200,
  detalle_venta_personalizadas: [
    { id: 1, lado_a: 21, lado_b: 27, id_venta: 6, created_at: '', updated_at: '' },
    { id: 2, lado_a: 30, lado_b: 40, id_venta: 6, created_at: '', updated_at: '' },
  ],
});

// ─────────────────────────────────────────────────────────────────────────────

describe('VentasCalculosService', () => {
  let service: VentasCalculosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VentasCalculosService);
  });

  it('debería crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  // ── calcularEstadisticas ─────────────────────────────────────────────────
  describe('calcularEstadisticas', () => {
    it('debería devolver estadísticas vacías para array vacío', () => {
      const stats = service.calcularEstadisticas([]);

      expect(stats.totalVentas).toBe(0);
      expect(stats.totalIngresos).toBe(0);
      expect(stats.ventasCompletadas).toBe(0);
      expect(stats.ventasPendientes).toBe(0);
      expect(stats.promedioVenta).toBe(0);
      expect(stats.porcentajeCompletadas).toBe(0);
    });

    it('debería calcular estadísticas básicas correctamente', () => {
      const ventas = [ventaCompletada, ventaPendiente1, ventaPendiente2];

      const stats = service.calcularEstadisticas(ventas);

      expect(stats.totalVentas).toBe(3);
      expect(stats.ventasCompletadas).toBe(1);
      expect(stats.ventasPendientes).toBe(2);
    });

    it('debería calcular totalIngresos como suma de precioTotal de todas las ventas', () => {
      const ventas = [ventaCompletada, ventaPendiente1]; // 150 + 80

      const stats = service.calcularEstadisticas(ventas);

      expect(stats.totalIngresos).toBe(230);
    });

    it('debería calcular promedioVenta correctamente', () => {
      const ventas = [ventaCompletada, ventaPendiente1]; // 150 + 80 = 230 / 2 = 115

      const stats = service.calcularEstadisticas(ventas);

      expect(stats.promedioVenta).toBe(115);
    });

    it('debería calcular porcentajeCompletadas correctamente', () => {
      const ventas = [ventaCompletada, ventaCompletada2, ventaPendiente1]; // 2 de 3 = 66.67%

      const stats = service.calcularEstadisticas(ventas);

      expect(stats.porcentajeCompletadas).toBeCloseTo(66.67, 1);
    });

    it('debería ser 100% completadas cuando todas están completadas', () => {
      const stats = service.calcularEstadisticas([ventaCompletada, ventaCompletada2]);

      expect(stats.porcentajeCompletadas).toBe(100);
    });

    it('debería ser 0% completadas cuando ninguna está completada', () => {
      const stats = service.calcularEstadisticas([ventaPendiente1, ventaPendiente2]);

      expect(stats.porcentajeCompletadas).toBe(0);
    });
  });

  // ── calcularIngresosTotales ──────────────────────────────────────────────
  describe('calcularIngresosTotales', () => {
    it('debería sumar los precioTotal de todas las ventas (completadas + pendientes)', () => {
      const ventas = [ventaCompletada, ventaPendiente1, ventaPendiente2]; // 150+80+60

      expect(service.calcularIngresosTotales(ventas)).toBe(290);
    });

    it('debería devolver 0 para array vacío', () => {
      expect(service.calcularIngresosTotales([])).toBe(0);
    });

    it('debería manejar precioTotal undefined (=0)', () => {
      const v = makeVenta({ precioTotal: undefined as any });

      expect(service.calcularIngresosTotales([v])).toBe(0);
    });
  });

  // ── calcularIngresosCompletados ──────────────────────────────────────────
  describe('calcularIngresosCompletados', () => {
    it('debería sumar solo los ingresos de ventas completadas', () => {
      const ventas = [ventaCompletada, ventaCompletada2, ventaPendiente1];
      // Solo 150 + 200 = 350

      expect(service.calcularIngresosCompletados(ventas)).toBe(350);
    });

    it('debería devolver 0 si no hay completadas', () => {
      expect(service.calcularIngresosCompletados([ventaPendiente1, ventaPendiente2])).toBe(0);
    });

    it('debería devolver 0 para array vacío', () => {
      expect(service.calcularIngresosCompletados([])).toBe(0);
    });
  });

  // ── calcularSaldosPendientes ─────────────────────────────────────────────
  describe('calcularSaldosPendientes', () => {
    it('debería sumar los saldoFalante de ventas no recogidas', () => {
      // ventaPendiente1.saldoFalante = 80, ventaPendiente2.saldoFalante = 30
      const ventas = [ventaCompletada, ventaPendiente1, ventaPendiente2];

      expect(service.calcularSaldosPendientes(ventas)).toBe(110);
    });

    it('debería devolver 0 si todas están completadas', () => {
      expect(service.calcularSaldosPendientes([ventaCompletada, ventaCompletada2])).toBe(0);
    });

    it('debería devolver 0 para array vacío', () => {
      expect(service.calcularSaldosPendientes([])).toBe(0);
    });
  });

  // ── contarProductosVendidos ──────────────────────────────────────────────
  describe('contarProductosVendidos', () => {
    it('debería sumar las cantidades de todos los detalles de productos', () => {
      // ventaConProductos tiene 3+2 = 5 productos
      expect(service.contarProductosVendidos([ventaConProductos])).toBe(5);
    });

    it('debería acumular de múltiples ventas', () => {
      const otra = makeVenta({
        detalle_venta_productos: [
          { id: 3, cantidad: 4, precio: 20, idVenta: 9, idProducto: 3, id_stock_producto: 3, created_at: '', updated_at: '' },
        ],
      });

      // 5 + 4 = 9
      expect(service.contarProductosVendidos([ventaConProductos, otra])).toBe(9);
    });

    it('debería devolver 0 si no hay detalles de productos', () => {
      const venta = makeVenta({ detalle_venta_productos: [] });

      expect(service.contarProductosVendidos([venta])).toBe(0);
    });

    it('debería devolver 0 para array vacío', () => {
      expect(service.contarProductosVendidos([])).toBe(0);
    });
  });

  // ── contarCuadrosPersonalizados ──────────────────────────────────────────
  describe('contarCuadrosPersonalizados', () => {
    it('debería contar cuadros por número de entradas en detalle_venta_personalizadas', () => {
      // ventaConCuadros tiene 2 cuadros
      expect(service.contarCuadrosPersonalizados([ventaConCuadros])).toBe(2);
    });

    it('debería acumular de múltiples ventas', () => {
      const otra = makeVenta({
        detalle_venta_personalizadas: [
          { id: 3, lado_a: 15, lado_b: 20, id_venta: 10, created_at: '', updated_at: '' },
        ],
      });

      expect(service.contarCuadrosPersonalizados([ventaConCuadros, otra])).toBe(3);
    });

    it('debería devolver 0 si no hay cuadros', () => {
      expect(service.contarCuadrosPersonalizados([makeVenta({ detalle_venta_personalizadas: [] })])).toBe(0);
    });
  });

  // ── obtenerVentasDelDia ──────────────────────────────────────────────────
  describe('obtenerVentasDelDia', () => {
    it('debería retornar solo las ventas de hoy', () => {
      const hoy = new Date().toISOString();
      const ayer = daysAgo(1);

      const ventaHoy = makeVenta({ id: 1, fecha: hoy });
      const ventaAyer = makeVenta({ id: 2, fecha: ayer });

      const resultado = service.obtenerVentasDelDia([ventaHoy, ventaAyer]);

      expect(resultado.length).toBe(1);
      expect(resultado[0].id).toBe(1);
    });

    it('debería retornar array vacío si no hay ventas de hoy', () => {
      const ventaAyer = makeVenta({ fecha: daysAgo(1) });

      expect(service.obtenerVentasDelDia([ventaAyer])).toEqual([]);
    });

    it('debería retornar [] para array vacío', () => {
      expect(service.obtenerVentasDelDia([])).toEqual([]);
    });
  });

  // ── obtenerVentasDelMes ──────────────────────────────────────────────────
  describe('obtenerVentasDelMes', () => {
    it('debería incluir ventas de este mes', () => {
      const esteM = makeVenta({ id: 1, fecha: new Date().toISOString() });
      const mesAnterior = makeVenta({ id: 2, fecha: monthsAgo(1) });

      const resultado = service.obtenerVentasDelMes([esteM, mesAnterior]);

      expect(resultado.length).toBe(1);
      expect(resultado[0].id).toBe(1);
    });

    it('debería retornar [] si no hay ventas de este mes', () => {
      const ventas = [
        makeVenta({ id: 1, fecha: monthsAgo(2) }),
        makeVenta({ id: 2, fecha: monthsAgo(3) }),
      ];

      expect(service.obtenerVentasDelMes(ventas)).toEqual([]);
    });
  });

  // ── calcularEstadisticas con productos y cuadros ─────────────────────────
  describe('calcularEstadisticas — conteo de productos y cuadros', () => {
    it('debería contar productos y cuadros dentro de calcularEstadisticas', () => {
      const ventas = [ventaConProductos, ventaConCuadros];

      const stats = service.calcularEstadisticas(ventas);

      expect(stats.totalProductos).toBe(5);          // 3+2
      expect(stats.totalCuadrosPersonalizados).toBe(2); // 2 cuadros
    });
  });
});
