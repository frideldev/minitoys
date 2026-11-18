import { Injectable, inject } from '@angular/core';
import { VentasStateService } from './ventas-state.service';
import { VentaRequest, VentaProductoMarcoRequest } from '../interfaces/venta.interface';
import { ItemVenta } from '../interfaces/item-venta.interface';
import { VentaAdapterService, TipoVenta } from './venta-adapter.service';
import { PriceUtils } from '../../../../shared/utils/price.utils';

@Injectable({
  providedIn: 'root'
})
export class VentaOperationsService {
  private ventasStateService = inject(VentasStateService);
  private ventaAdapterService = inject(VentaAdapterService);

  /**
   * Crear venta unificada usando los casos específicos del negocio
   * Maneja automáticamente todos los casos según adelanto y tipo de venta
   */
  async crearVentaUnificada(
    items: ItemVenta[], 
    clienteId: number, 
    sucursalId: number, 
    formaPagoId: number,
    usuarioId: number,
    total: number, 
    adelanto: number,
    esVentaDirecta: boolean = false,
    descuento: number = 0
  ): Promise<{ success: boolean; preventaId?: number; error?: string; tipoVenta?: TipoVenta }> {
    
    // Convertir Bs → centavos antes de enviar al API
    const totalCentavos   = PriceUtils.toApi(total);
    const adelantoCentavos = PriceUtils.toApi(adelanto);
    const descuentoCentavos = PriceUtils.toApi(descuento);

    // Preparar venta usando el adaptador
    const preparacion = this.ventaAdapterService.prepararVentaProductos(
      items,
      clienteId,
      formaPagoId,
      adelantoCentavos,
      totalCentavos
    );

    if (!preparacion.isValid) {
      return { success: false, error: preparacion.error };
    }

    // Sobrescribir tipo si es venta directa forzada
    let parametrosVenta = preparacion.parametrosVenta!;
    let tipoVenta = preparacion.tipoVenta!;
    
    if (esVentaDirecta) {
      tipoVenta = 'directa';
      // ✅ CORRECCIÓN: Para venta directa, usar adelanto real (0 para efectivo/QR)
      parametrosVenta = this.ventaAdapterService.determinarParametrosVenta('directa', totalCentavos, adelantoCentavos, formaPagoId);
    }

    const ventaRequest: VentaProductoMarcoRequest = {
      pago: parametrosVenta.pago,                                           // Nuevo: parámetro pago (centavos)
      entregado: parametrosVenta.entregado,                                 // Nuevo: parámetro entregado
      adelanto: adelantoCentavos > 0 ? adelantoCentavos : undefined,        // Nuevo: adelanto opcional (centavos)
      saldo: parametrosVenta.saldo,                                         // Compatibilidad: monto pagado (centavos)
      idCliente: clienteId,
      idSucursal: sucursalId,
      idFormaPago: parametrosVenta.idFormaPago,
      idUsuario: usuarioId,
      fechaEntrega: undefined, // Por ahora no se maneja en productos
      descuento: descuentoCentavos > 0 ? descuentoCentavos : undefined,     // Descuento aplicado (centavos)
      detalles: preparacion.detalles!
    };

    console.log('🎯 VentaOperationsService.crearVentaUnificada:', {
      tipoVenta,
      parametrosVenta,
      ventaRequest,
      items_originales: items,
      es_venta_directa: esVentaDirecta
    });

    const preventaAnterior = this.ventasStateService.state().currentPreventa; // capturar ANTES de disparar
    const errorAnterior = this.ventasStateService.state().error;
    this.ventasStateService.createPreventa(ventaRequest);

    return new Promise((resolve) => {
      let attempts = 0;
      const maxAttempts = 12; // 12 × 350ms = ~4 seg máximo
      const poll = () => {
        attempts++;
        const state = this.ventasStateService.state();
        const preventa = state.currentPreventa;
        const error = state.error;

        // CRÍTICO: verificar que sea una preventa NUEVA (distinta a la anterior)
        // Esto evita resolver con datos del registro previo cuando el estado
        // aún no fue limpiado antes de que llegue la respuesta de la API.
        if (preventa && preventa !== preventaAnterior) {
          const ventaData = (preventa as any)?.venta || preventa;
          const preventaId = ventaData?.id;
          resolve({ success: true, preventaId, tipoVenta });
        } else if (error && error !== errorAnterior) {
          // Solo tratar como error si es NUEVO (no residual de operación anterior)
          resolve({ success: false, error, tipoVenta });
        } else if (attempts >= maxAttempts) {
          resolve({
            success: false,
            error: 'Sin respuesta del servidor. Verifique en la lista de pendientes si la venta fue registrada.',
            tipoVenta
          });
        } else {
          setTimeout(poll, 350);
        }
      };
      setTimeout(poll, 500);
    });
  }


  async createPreventa(
    items: ItemVenta[], 
    clienteId: number, 
    sucursalId: number, 
    formaPagoId: number,
    usuarioId: number,
    total: number, 
    adelanto: number
  ): Promise<{ success: boolean; preventaId?: number; error?: string }> {
    const ventaRequest: VentaProductoMarcoRequest = {
      pago: adelanto,        // Nuevo: monto pagado
      entregado: false,      // Nuevo: no entregado para preventa
      adelanto: adelanto > 0 ? adelanto : undefined,   // Nuevo: adelanto opcional
      saldo: adelanto,       // Compatibilidad: monto adelantado
      idCliente: clienteId,
      idSucursal: sucursalId,
      idFormaPago: formaPagoId,
      idUsuario: usuarioId,
      fechaEntrega: undefined, // Legacy: no maneja fecha entrega
      detalles: items.map(item => ({
        idProducto: item.id,
        cantidad: item.cantidad
      }))
    };

    this.ventasStateService.createPreventa(ventaRequest);

    return new Promise((resolve) => {
      setTimeout(() => {
        const state = this.ventasStateService.state();
        const preventa = state.currentPreventa;
        const error = state.error;

        if (preventa) {
          const ventaData = (preventa as any)?.venta || preventa;
          const preventaId = ventaData?.id;
          resolve({ success: true, preventaId });
        } else if (error) {
          resolve({ success: false, error });
        } else {
          resolve({ success: false, error: 'Error desconocido' });
        }
      }, 800); // Timeout más conservador
    });
  }

  async completarVenta(preventaId: number, idFormaPago: number): Promise<{ success: boolean; error?: string; ventaId?: number }> {
    const errorAnteriorCompletar = this.ventasStateService.state().error;
    this.ventasStateService.completarVenta(preventaId, idFormaPago);

    return new Promise((resolve) => {
      let attempts = 0;
      const maxAttempts = 10; // 10 × 300ms = 3 seg máximo
      const poll = () => {
        attempts++;
        const estado = this.ventasStateService.state();
        if (estado.error && estado.error !== errorAnteriorCompletar) {
          // Nuevo error detectado → fallo real
          resolve({ success: false, error: estado.error });
        } else if (attempts >= maxAttempts) {
          // Sin error nuevo después de espera → asumir éxito
          resolve({ success: true, ventaId: preventaId });
        } else {
          setTimeout(poll, 300);
        }
      };
      setTimeout(poll, 800);
    });
  }

  async cancelarVenta(preventaId: number): Promise<{ success: boolean; error?: string }> {
    const errorAnteriorCancelar = this.ventasStateService.state().error;
    this.ventasStateService.cancelarVenta(preventaId);

    return new Promise((resolve) => {
      let attempts = 0;
      const maxAttempts = 6; // 6 × 250ms = 1.5 seg
      const poll = () => {
        attempts++;
        const error = this.ventasStateService.state().error;
        if (error && error !== errorAnteriorCancelar) {
          resolve({ success: false, error });
        } else if (attempts >= maxAttempts) {
          resolve({ success: true });
        } else {
          setTimeout(poll, 250);
        }
      };
      setTimeout(poll, 500);
    });
  }

  async cargarVentaCompleta(preventaId: number): Promise<{ success: boolean; venta?: any; error?: string }> {
    const errorAnteriorCargar = this.ventasStateService.state().error;
    this.ventasStateService.getVentaCompleta(preventaId);

    return new Promise((resolve) => {
      let attempts = 0;
      const maxAttempts = 8; // 8 × 300ms = 2.4 seg
      const poll = () => {
        attempts++;
        const state = this.ventasStateService.state();
        const ventaCompleta = state.selectedVenta;
        const error = state.error;
        if (ventaCompleta) {
          resolve({ success: true, venta: ventaCompleta });
        } else if (error && error !== errorAnteriorCargar) {
          resolve({ success: false, error });
        } else if (attempts >= maxAttempts) {
          resolve({ success: false, error: 'No se pudo cargar la venta. Intente nuevamente.' });
        } else {
          setTimeout(poll, 300);
        }
      };
      setTimeout(poll, 500);
    });
  }

  async crearYCompletarVenta(
    items: ItemVenta[], 
    clienteId: number, 
    sucursalId: number,
    formaPagoId: number,
    usuarioId: number
  ): Promise<{ success: boolean; error?: string; ventaId?: number }> {
    // Calcular el total correcto basado en los items
    const total = items.reduce((acc, item) => acc + item.subtotal, 0);
    
    const ventaRequest: VentaProductoMarcoRequest = {
      pago: 0,            // ✅ CORRECCIÓN: Para venta directa SIN adelanto, pago = 0
      entregado: true,    // Nuevo: entregado inmediatamente
      adelanto: undefined, // Nuevo: sin adelanto para venta directa
      saldo: 0,           // ✅ CORRECCIÓN: Para venta directa SIN adelanto, saldo = 0
      idCliente: clienteId,
      idSucursal: sucursalId,
      idFormaPago: formaPagoId,
      idUsuario: usuarioId,
      fechaEntrega: undefined, // Legacy: no maneja fecha entrega
      detalles: items.map(item => ({
        idProducto: item.id,
        cantidad: item.cantidad
      }))
    };

    this.ventasStateService.createPreventa(ventaRequest);

    return new Promise((resolve) => {
      setTimeout(() => {
        const preventa = this.ventasStateService.state().currentPreventa;
        const ventaData = (preventa as any)?.venta || preventa;
        const preventaId = ventaData?.id;

        if (preventaId) {
          // Use the formaPagoId parameter passed to the method
          this.completarVenta(preventaId, formaPagoId).then((result) => {
            resolve({ 
              ...result, 
              ventaId: result.success ? preventaId : undefined 
            });
          });
        } else {
          const error = this.ventasStateService.state().error;
          resolve({ 
            success: false, 
            error: error || 'No se pudo obtener el ID de la preventa' 
          });
        }
      }, 1500); // Aumentar un poco el timeout para ayudar con el primer registro
    });
  }

  refreshData(): void {
    this.ventasStateService.refreshData();
  }
}