import { Injectable, inject } from '@angular/core';
import { PendingItem } from '../../../../shared/ui/pending-list/interfaces/pending-item.interface';
import { VentaOperationsService } from './venta-operations.service';
import { PendingItemsService } from './pending-items.service';
import { FormasPagoStateService } from '../../../services/formaspago-state.service';

@Injectable({
  providedIn: 'root'
})
export class VentasUIService {
  private ventaOperationsService = inject(VentaOperationsService);
  private pendingItemsService = inject(PendingItemsService);
  private formasPagoStateService = inject(FormasPagoStateService);

  async handlePendingItemClick(item: PendingItem, cargarPreventaCallback: (id: number) => void) {
    switch (item.type) {
      case 'preventa':
        if (item.metadata?.preventaId) {
          cargarPreventaCallback(item.metadata.preventaId);
        }
        break;
      case 'order':
        // Redirigir a la página de pedidos o abrir modal
        break;
      case 'payment':
        // Abrir modal de confirmación de pago
        break;
      default:
        // Ver detalles del item
        break;
    }
  }

  async handlePendingActionClick(
    event: { action: string; item: PendingItem; formaPagoId?: number },
    pendingItems: PendingItem[],
    refreshCallback: () => void,
    mostrarReciboCallback?: (ventaId: number) => void
  ): Promise<PendingItem[]> {
    const { action, item, formaPagoId } = event;
    
    switch (action) {
      case 'complete':
        if (item.type === 'preventa') {
          await this.completarPreventaFromPending(item, refreshCallback, formaPagoId, mostrarReciboCallback);
          return pendingItems;
        } else {
          return this.markPendingAsCompleted(item, pendingItems);
        }
        
      case 'cancel':
        if (item.type === 'preventa') {
          await this.cancelarPreventaFromPending(item, refreshCallback);
          return pendingItems;
        } else {
          return this.cancelPendingItem(item, pendingItems);
        }
        
      case 'process':
        return this.processPendingItem(item, pendingItems);
        
      case 'confirm':
        return this.confirmPendingItem(item, pendingItems);
        
      case 'view':
        // Re-usar el handler de click
        await this.handlePendingItemClick(item, () => {});
        return pendingItems;
        
      default:
        console.log('Acción no reconocida:', action, item);
        return pendingItems;
    }
  }

  private async completarPreventaFromPending(
    item: PendingItem,
    refreshCallback: () => void,
    formaPagoId?: number,
    mostrarReciboCallback?: (ventaId: number) => void
  ) {
    if (item.metadata?.preventaId) {
      console.log('Completando preventa con forma de pago:', formaPagoId);
      
      let confirmMessage = `¿Completar preventa ${item.title}?`;
      
      if (formaPagoId) {
        const formaPago = this.formasPagoStateService.state().formasPago.find(fp => fp.id === formaPagoId);
        const formaPagoNombre = formaPago?.nombre || 'Forma de pago desconocida';
        confirmMessage = `¿Completar preventa ${item.title} con ${formaPagoNombre}?`;
      }
        
      if (confirm(confirmMessage)) {
        if (!formaPagoId) {
          alert('Error: Se requiere seleccionar una forma de pago para completar la venta');
          return;
        }
        
        const result = await this.ventaOperationsService.completarVenta(item.metadata.preventaId, formaPagoId);
        
        if (result.success) {
          alert('Preventa completada exitosamente. Se mostrará el recibo a continuación...');
          this.ventaOperationsService.refreshData();
          setTimeout(() => refreshCallback(), 200);
          // Mostrar recibo si hay callback disponible
          if (mostrarReciboCallback && result.ventaId) {
            setTimeout(() => mostrarReciboCallback(result.ventaId!), 800);
          }
        } else {
          alert(`Error al completar preventa: ${result.error}`);
        }
      }
    }
  }

  private async cancelarPreventaFromPending(item: PendingItem, refreshCallback: () => void) {
    if (item.metadata?.preventaId) {
      if (confirm(`¿Cancelar preventa ${item.title}?`)) {
        const result = await this.ventaOperationsService.cancelarVenta(item.metadata.preventaId);
        
        if (result.success) {
          alert('Preventa cancelada exitosamente');
          this.ventaOperationsService.refreshData();
          setTimeout(() => refreshCallback(), 200);
        } else {
          alert(`Error al cancelar preventa: ${result.error}`);
        }
      }
    }
  }

  private markPendingAsCompleted(item: PendingItem, pendingItems: PendingItem[]): PendingItem[] {
    if (confirm(`¿Marcar como completado: ${item.title}?`)) {
      const updatedItems = this.pendingItemsService.updatePendingItemStatus(
        pendingItems, 
        item.id, 
        'completed'
      );
      alert('Marcado como completado');
      return updatedItems;
    }
    return pendingItems;
  }

  private cancelPendingItem(item: PendingItem, pendingItems: PendingItem[]): PendingItem[] {
    if (confirm(`¿Cancelar: ${item.title}?`)) {
      const updatedItems = this.pendingItemsService.updatePendingItemStatus(
        pendingItems, 
        item.id, 
        'cancelled'
      );
      alert('Cancelado exitosamente');
      return updatedItems;
    }
    return pendingItems;
  }

  private processPendingItem(item: PendingItem, pendingItems: PendingItem[]): PendingItem[] {
    const updatedItems = this.pendingItemsService.updatePendingItemStatus(
      pendingItems, 
      item.id, 
      'in_progress'
    );
    alert('Marcado como en proceso');
    return updatedItems;
  }

  private confirmPendingItem(item: PendingItem, pendingItems: PendingItem[]): PendingItem[] {
    if (confirm(`¿Confirmar: ${item.title}?`)) {
      const updatedItems = this.pendingItemsService.updatePendingItemStatus(
        pendingItems, 
        item.id, 
        'completed'
      );
      alert('Confirmado exitosamente');
      return updatedItems;
    }
    return pendingItems;
  }
}
