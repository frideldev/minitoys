import { Injectable } from '@angular/core';
import { DetalleVenta } from '../interfaces/venta.interface';

/**
 * Tipos de venta según los casos requeridos
 */
export type TipoVenta = 'directa' | 'preventa_sin_adelanto' | 'preventa_con_adelanto' | 'marco_sin_adelanto' | 'marco_con_adelanto';

@Injectable({
  providedIn: 'root'
})
export class VentaAdapterService {

  /**
   * Determina los parámetros de API basado en el tipo de venta
   * Casos implementados:
   * - Venta directa: pago = total, recogido = true
   * - Preventa sin adelanto: pago = 0, recogido = false, usa formaPagoId seleccionado
   * - Preventa con adelanto: pago = adelanto, recogido = false
   * - Marco sin adelanto: pago = 0, recogido = false, usa formaPagoId seleccionado  
   * - Marco con adelanto: pago = adelanto, recogido = false
   */
  determinarParametrosVenta(tipoVenta: TipoVenta, total: number, adelanto: number, formaPagoId: number): {
    pago: number;        // Nuevo: parámetro pago del API
    entregado: boolean;  // Nuevo: parámetro entregado del API
    saldo: number;       // Compatibilidad: monto pagado
    recogido: boolean;   // Compatibilidad: recogido
    idFormaPago: number;
  } {
    switch (tipoVenta) {
      case 'directa':
        return {
          pago: 0,            // ✅ CORRECCIÓN: Para venta directa SIN adelanto, pago = 0
          entregado: true,    // Nuevo: entregado inmediatamente
          saldo: 0,           // ✅ CORRECCIÓN: Para venta directa SIN adelanto, saldo = 0
          recogido: true,     // Compatibilidad: entregado inmediatamente
          idFormaPago: formaPagoId // Forma de pago seleccionada
        };
        
      case 'preventa_sin_adelanto':
      case 'marco_sin_adelanto':
        return {
          pago: 0,          // Nuevo: sin pago inicial
          entregado: false, // Nuevo: no entregado
          saldo: 0,         // Compatibilidad: sin adelanto
          recogido: false,  // Compatibilidad: no entregado
          idFormaPago: formaPagoId // Forma de pago seleccionada para cuando se complete
        };
        
      case 'preventa_con_adelanto':
      case 'marco_con_adelanto':
        return {
          pago: adelanto,   // Nuevo: monto pagado como adelanto
          entregado: false, // Nuevo: no entregado hasta pago completo
          saldo: adelanto,  // Compatibilidad: monto adelantado
          recogido: false,  // Compatibilidad: no entregado hasta pago completo
          idFormaPago: formaPagoId // Forma de pago del adelanto
        };
        
      default:
        throw new Error(`Tipo de venta no reconocido: ${tipoVenta}`);
    }
  }

  /**
   * Prepara los datos para una venta de productos 
   */
  prepararVentaProductos(
    items: any[],
    clienteId: number,
    formaPagoId: number,
    montoAdelantado: number,
    total: number
  ): {
    isValid: boolean;
    error?: string;
    detalles?: DetalleVenta[];
    tipoVenta?: TipoVenta;
    parametrosVenta?: {
      pago: number;        // Nuevo campo
      entregado: boolean;  // Nuevo campo
      saldo: number;       // Compatibilidad
      recogido: boolean;   // Compatibilidad
      idFormaPago: number;
    };
  } {
    if (!items || items.length === 0) {
      return { isValid: false, error: 'Se requiere seleccionar al menos un producto' };
    }

    // Determinar tipo de venta basado en el adelanto
    let tipoVenta: TipoVenta;
    if (montoAdelantado === 0) {
      tipoVenta = 'preventa_sin_adelanto';
    } else if (montoAdelantado >= total) {
      // CORRECCIÓN: Aunque se pague todo, si hay adelanto inicial, usar preventa_con_adelanto
      // para que pago = adelanto (no total)
      tipoVenta = 'preventa_con_adelanto';
    } else {
      tipoVenta = 'preventa_con_adelanto';
    }

    // Obtener parámetros de venta
    const parametrosVenta = this.determinarParametrosVenta(tipoVenta, total, montoAdelantado, formaPagoId);

    // Crear detalles de productos
    const detalles: DetalleVenta[] = items.map(item => ({
      idProducto: item.id,
      cantidad: item.cantidad
    }));

    return {
      isValid: true,
      detalles,
      tipoVenta,
      parametrosVenta
    };
  }
}
