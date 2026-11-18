import { Injectable, inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ItemVenta } from '../interfaces/item-venta.interface';
import { VentaOperationsService } from './venta-operations.service';

@Injectable({
  providedIn: 'root'
})
export class VentasComponentOperationsService {
  private ventaOperationsService = inject(VentaOperationsService);

  async createPreventa(
    form: FormGroup,
    items: ItemVenta[],
    total: number,
    isProcessing: boolean,
    setProcessingCallback: (value: boolean) => void,
    limpiarFormularioCallback: () => void,
    refreshPendingCallback: () => void,
    mostrarReciboCallback?: (ventaId: number) => void
  ): Promise<boolean> {
    if (!this.puedeCompletarVenta(form, items, isProcessing)) return false;
    
    setProcessingCallback(true);
    
    const clienteId = Number(form.get('cliente_id')?.value);
    const sucursalId = Number(form.get('sucursal_id')?.value);
    const formaPagoId = Number(form.get('forma_pago_id')?.value);
    const usuarioId = Number(form.get('usuario_id')?.value);
    const adelanto = Number(form.get('adelanto')?.value) || 0;

    // Calcular el total real basado en los items para asegurar precisión
    const totalCalculado = items.reduce((acc, item) => acc + item.subtotal, 0);
    const descuento = Number(form.get('descuento')?.value) || 0;
    const totalFinal = totalCalculado - descuento;

    // Usar el nuevo método unificado que maneja todos los casos automáticamente
    const result = await this.ventaOperationsService.crearVentaUnificada(
      items, 
      clienteId, 
      sucursalId, 
      formaPagoId, 
      usuarioId, 
      totalFinal, 
      adelanto,
      false, // No es venta directa
      descuento
    );
    
    setProcessingCallback(false);
    
    if (result.success) {
      const mensaje = this.getMensajeExitoVenta(result.tipoVenta, adelanto, totalFinal);
      alert(mensaje + ` ID: ${result.preventaId}`);
      limpiarFormularioCallback();
      setTimeout(() => refreshPendingCallback(), 200);
      if (mostrarReciboCallback && result.preventaId) {
        setTimeout(() => mostrarReciboCallback(result.preventaId!), 1000);
      }
    } else {
      alert(`Error al crear venta: ${result.error}`);
    }
    
    return result.success;
  }

  async completarVenta(
    form: FormGroup,
    items: ItemVenta[],
    currentPreventaId: number | null,
    isProcessing: boolean,
    setProcessingCallback: (value: boolean) => void,
    limpiarFormularioCallback: () => void,
    refreshCallback: () => void,
    mostrarReciboCallback?: (ventaId: number) => void
  ): Promise<void> {
    if (isProcessing) return;
    
    if (!this.puedeCompletarVenta(form, items, isProcessing)) {
      this.showValidationAlert(form, items);
      return;
    }
    
    setProcessingCallback(true);
    
    if (currentPreventaId) {
      const formaPagoId = Number(form.get('forma_pago_id')?.value);
      await this.completarPreventaExistente(currentPreventaId, formaPagoId, setProcessingCallback, limpiarFormularioCallback, refreshCallback, mostrarReciboCallback);
    } else {
      await this.crearYCompletarVenta(form, items, setProcessingCallback, limpiarFormularioCallback, mostrarReciboCallback);
    }
  }

  async cargarPreventa(preventaId: number, form: FormGroup, setCurrentPreventaCallback: (id: number) => void, setItemsCallback: (items: ItemVenta[]) => void, calcularTotalesCallback: () => void): Promise<void> {
    const result = await this.ventaOperationsService.cargarVentaCompleta(preventaId);
    
    if (result.success && result.venta) {
      const ventaCompleta = result.venta;
      setCurrentPreventaCallback(ventaCompleta.id);
      
      form.patchValue({
        cliente_id: ventaCompleta.idCliente.toString(),
        sucursal_id: ventaCompleta.idSucursal
      });
      
      if (ventaCompleta.productos) {
        const items = ventaCompleta.productos.map((p: any) => ({
          id: p.id,
          descripcion: '',
          cantidad: p.cantidad,
          precioUnitario: p.precio,
          subtotal: p.subtotal
        }));
        setItemsCallback(items);
        calcularTotalesCallback();
      }
      
      alert(`Preventa ${preventaId} cargada exitosamente`);
    } else {
      alert(`Error al cargar preventa: ${result.error}`);
    }
  }

  async cancelarPreventa(currentPreventaId: number | null, limpiarFormularioCallback: () => void): Promise<void> {
    if (currentPreventaId && confirm('¿Estás seguro de que deseas cancelar esta preventa?')) {
      const result = await this.ventaOperationsService.cancelarVenta(currentPreventaId);
      
      if (result.success) {
        alert('Preventa cancelada exitosamente');
        limpiarFormularioCallback();
      } else {
        alert(`Error al cancelar preventa: ${result.error}`);
      }
    }
  }

  private puedeCompletarVenta(form: FormGroup, items: ItemVenta[], isProcessing: boolean): boolean {
    const clienteId = form.get('cliente_id')?.value;
    const metodoPago = form.get('metodo_pago')?.value;
    const formaPagoId = form.get('forma_pago_id')?.value;
    return !!(clienteId && metodoPago && formaPagoId && items.length > 0 && !isProcessing);
  }

  private showValidationAlert(form: FormGroup, items: ItemVenta[]): void {
    const condiciones = {
      clienteId: form.get('cliente_id')?.value,
      metodoPago: form.get('metodo_pago')?.value,
      formaPagoId: form.get('forma_pago_id')?.value,
      itemsLength: items.length
    };
    
    alert('Faltan datos requeridos:\n' + 
      `Cliente: ${condiciones.clienteId ? '✓' : '✗'}\n` +
      `Método de pago: ${condiciones.metodoPago ? '✓' : '✗'}\n` +
      `Forma de pago: ${condiciones.formaPagoId ? '✓' : '✗'}\n` +
      `Productos: ${condiciones.itemsLength > 0 ? '✓' : '✗'}`);
  }

  private async completarPreventaExistente(
    preventaId: number,
    idFormaPago: number,
    setProcessingCallback: (value: boolean) => void, 
    limpiarFormularioCallback: () => void, 
    refreshCallback: () => void,
    mostrarReciboCallback?: (ventaId: number) => void
  ): Promise<void> {
    const result = await this.ventaOperationsService.completarVenta(preventaId, idFormaPago);
    setProcessingCallback(false);
    
    if (result.success) {
      console.log('Preventa completada, ventaId:', result.ventaId);
      alert('Preventa completada exitosamente. Se mostrará el recibo a continuación...');
      limpiarFormularioCallback();
      this.ventaOperationsService.refreshData();
      setTimeout(() => refreshCallback(), 200);
      
      // Mostrar recibo después de completar la venta usando el ventaId devuelto
      if (mostrarReciboCallback && result.ventaId) {
        console.log('Llamando mostrarReciboCallback con ventaId:', result.ventaId);
        setTimeout(() => mostrarReciboCallback(result.ventaId!), 1000);
      }
    } else {
      alert(`Error al completar preventa: ${result.error}`);
    }
  }

  private async crearYCompletarVenta(
    form: FormGroup, 
    items: ItemVenta[], 
    setProcessingCallback: (value: boolean) => void, 
    limpiarFormularioCallback: () => void,
    mostrarReciboCallback?: (ventaId: number) => void
  ): Promise<void> {
    const clienteId = Number(form.get('cliente_id')?.value);
    const sucursalId = Number(form.get('sucursal_id')?.value);
    const formaPagoId = Number(form.get('forma_pago_id')?.value);
    const usuarioId = Number(form.get('usuario_id')?.value);
    const descuentoDirecta = Number(form.get('descuento')?.value) || 0;
    
    // Calcular total para venta directa (con descuento)
    const totalCalculado = items.reduce((acc, item) => acc + item.subtotal, 0);
    const totalFinalDirecta = totalCalculado - descuentoDirecta;
    
    // ✅ CORRECCIÓN: Para venta directa, adelanto debe ser 0
    // El backend maneja la lógica de pago completo
    const result = await this.ventaOperationsService.crearVentaUnificada(
      items, 
      clienteId, 
      sucursalId, 
      formaPagoId, 
      usuarioId, 
      totalFinalDirecta, 
      0, // ✅ Adelanto = 0 para venta directa (efectivo/QR)
      true, // Es venta directa
      descuentoDirecta
    );
    
    setProcessingCallback(false);
    
    if (result.success) {
      console.log('Venta directa completada, preventaId:', result.preventaId);
      alert('Venta completada exitosamente. Se mostrará el recibo a continuación...');
      limpiarFormularioCallback();
      
      // Mostrar recibo después de completar la venta
      if (mostrarReciboCallback && result.preventaId) {
        console.log('Llamando mostrarReciboCallback con preventaId:', result.preventaId);
        setTimeout(() => mostrarReciboCallback(result.preventaId!), 1000);
      }
    } else {
      alert(`Error al completar venta: ${result.error}`);
      limpiarFormularioCallback();
    }
  }

  /**
   * Obtiene el mensaje de éxito basado en el tipo de venta para productos
   */
  private getMensajeExitoVenta(tipoVenta?: string, adelanto?: number, total?: number): string {
    switch (tipoVenta) {
      case 'preventa_sin_adelanto':
        return '📝 Preventa registrada sin adelanto. Cliente pagará al recoger.';
      case 'preventa_con_adelanto':
        return `💰 Preventa registrada con adelanto de ${adelanto} Bs. Saldo pendiente: ${(total || 0) - (adelanto || 0)} Bs.`;
      case 'directa':
        return '✅ Venta completada y pagada. Lista para entrega.';
      default:
        return '✅ Venta registrada exitosamente.';
    }
  }
}
