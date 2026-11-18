import { TestBed } from '@angular/core/testing';
import { VentaAdapterService, TipoVenta } from './venta-adapter.service';

describe('VentaAdapterService', () => {
  let service: VentaAdapterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VentaAdapterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('determinarParametrosVenta', () => {
    it('should handle venta directa correctly', () => {
      const resultado = service.determinarParametrosVenta('directa', 100, 0, 1);
      
      expect(resultado).toEqual({
        pago: 0,           // ✅ Para venta directa SIN adelanto, pago = 0
        entregado: true,   // ✅ Entregado inmediatamente
        saldo: 0,          // ✅ Para venta directa SIN adelanto, saldo = 0
        recogido: true,    // ✅ Recogido inmediatamente
        idFormaPago: 1
      });
    });

    it('should handle preventa sin adelanto correctly', () => {
      const resultado = service.determinarParametrosVenta('preventa_sin_adelanto', 100, 0, 1);
      
      expect(resultado).toEqual({
        pago: 0,
        entregado: false,
        saldo: 0,
        recogido: false,
        idFormaPago: 1
      });
    });

    it('should handle preventa con adelanto correctly', () => {
      const resultado = service.determinarParametrosVenta('preventa_con_adelanto', 100, 50, 1);
      
      expect(resultado).toEqual({
        pago: 50,          // ✅ Pago = adelanto
        entregado: false,  
        saldo: 50,         // ✅ Saldo = adelanto
        recogido: false,
        idFormaPago: 1
      });
    });

    it('should handle marco sin adelanto correctly', () => {
      const resultado = service.determinarParametrosVenta('marco_sin_adelanto', 200, 0, 2);
      
      expect(resultado).toEqual({
        pago: 0,
        entregado: false,
        saldo: 0,
        recogido: false,
        idFormaPago: 2
      });
    });

    it('should handle marco con adelanto correctly', () => {
      const resultado = service.determinarParametrosVenta('marco_con_adelanto', 200, 100, 2);
      
      expect(resultado).toEqual({
        pago: 100,         // ✅ Pago = adelanto
        entregado: false,
        saldo: 100,        // ✅ Saldo = adelanto
        recogido: false,
        idFormaPago: 2
      });
    });

    it('should throw error for unknown tipo venta', () => {
      expect(() => {
        service.determinarParametrosVenta('unknown' as TipoVenta, 100, 50, 1);
      }).toThrow();
    });
  });

  describe('prepararVentaProductos', () => {
    const mockItems = [
      { id: 1, cantidad: 2 },
      { id: 2, cantidad: 1 }
    ];

    it('should prepare preventa sin adelanto correctly', () => {
      const resultado = service.prepararVentaProductos(mockItems, 1, 1, 0, 100);
      
      expect(resultado.isValid).toBe(true);
      expect(resultado.tipoVenta).toBe('preventa_sin_adelanto');
      expect(resultado.detalles?.length).toBe(2);
      expect(resultado.parametrosVenta?.pago).toBe(0);
      expect(resultado.parametrosVenta?.saldo).toBe(0);
    });

    it('should prepare preventa con adelanto correctly', () => {
      const resultado = service.prepararVentaProductos(mockItems, 1, 1, 50, 100);
      
      expect(resultado.isValid).toBe(true);
      expect(resultado.tipoVenta).toBe('preventa_con_adelanto');
      expect(resultado.parametrosVenta?.pago).toBe(50);
      expect(resultado.parametrosVenta?.saldo).toBe(50);
    });

    it('should handle full payment as preventa con adelanto', () => {
      const resultado = service.prepararVentaProductos(mockItems, 1, 1, 100, 100);
      
      expect(resultado.isValid).toBe(true);
      expect(resultado.tipoVenta).toBe('preventa_con_adelanto'); // ✅ Aunque sea pago completo
      expect(resultado.parametrosVenta?.pago).toBe(100);
    });

    it('should validate empty items', () => {
      const resultado = service.prepararVentaProductos([], 1, 1, 0, 100);
      
      expect(resultado.isValid).toBe(false);
      expect(resultado.error).toBe('Se requiere seleccionar al menos un producto');
    });

    it('should validate null items', () => {
      const resultado = service.prepararVentaProductos(null as any, 1, 1, 0, 100);
      
      expect(resultado.isValid).toBe(false);
      expect(resultado.error).toBe('Se requiere seleccionar al menos un producto');
    });
  });
});
