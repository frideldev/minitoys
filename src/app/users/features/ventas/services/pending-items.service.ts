import { Injectable, inject } from '@angular/core';
import { PendingItem } from '../../../../shared/ui/pending-list/interfaces/pending-item.interface';
import { ClientesStateService } from '../../../services/clientes-state.service';

@Injectable({
  providedIn: 'root'
})
export class PendingItemsService {
  private clientesState = inject(ClientesStateService);

  convertVentasToPendingItems(ventas: any[]): PendingItem[] {
    if (!ventas || ventas.length === 0) {
      return [];
    }

    const clientes = this.clientesState.state().clientes;

    const filteredVentas = ventas.filter(venta => {
      // Filtrar solo preventas (ventas no completadas)
      // Una preventa es una venta que NO ha sido recogida
      if (!venta) return false;
      
      // La lógica principal: si recogido es false, está pendiente
      return venta.recogido === false;
    });

    const mappedItems = filteredVentas.map((venta, index) => {
        // Buscar información del cliente
        const cliente = clientes.find(c => c.id === venta.idCliente);
        const clienteInfo = cliente 
          ? `${cliente.nombre} ${cliente.apellido} - ${cliente.telefono}`
          : `Cliente ID: ${venta.idCliente || 'N/A'}`;
        
        // Calcular el total de la venta
        const totalVenta = venta.precioTotal || ((venta.precioProducto || 0) + (venta.precioPerzonalizado || 0));
        // Ahora saldo representa el monto adelantado, calculamos lo pendiente
        const montoAdelantado = venta.saldo || 0;
        const saldoPendiente = totalVenta - montoAdelantado;
        const fechaFormateada = this.formatVentaDate(venta);
        
        return {
          id: venta.id || index + 1,
          type: 'preventa' as const,
          title: `Preventa #${venta.id || index + 1}`,
          subtitle: clienteInfo,
          description: `Total: $${totalVenta.toFixed(2)} • ${fechaFormateada}`,
          status: venta.recogido ? ('completed' as const) : ('pending' as const),
          priority: this.getVentaPriority(venta),
          date: fechaFormateada,
          amount: saldoPendiente,
          clientName: cliente?.full_name || `Cliente ${venta.idCliente || 'N/A'}`,
          metadata: {
            preventaId: venta.id,
            sucursalId: venta.idSucursal,
            fechaOriginal: venta.fecha || venta.created_at,
            cliente: cliente ? {
              id: cliente.id,
              nombre: cliente.nombre,
              apellido: cliente.apellido,
              telefono: cliente.telefono
            } : null
          }
        };
      });

    return mappedItems;
  }

  private getVentaPriority(venta: any): 'low' | 'medium' | 'high' | 'urgent' {
    const fechaCreacion = new Date(venta.fecha || venta.created_at || Date.now());
    const diasPendientes = Math.floor((Date.now() - fechaCreacion.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diasPendientes > 7) return 'urgent';
    if (diasPendientes > 3) return 'high';
    if (diasPendientes > 1) return 'medium';
    return 'low';
  }

  private formatVentaDate(venta: any): string {
    const fecha = venta.fecha || venta.created_at;
    
    if (!fecha) {
      return new Date().toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    }
    
    try {
      const fechaObj = new Date(fecha);
      
      // Verificar si la fecha es válida
      if (isNaN(fechaObj.getTime())) {
        return `Fecha inválida (${fecha})`;
      }
      
      // Formatear fecha y hora en español
      return fechaObj.toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch (error) {
      return `Error en fecha (${fecha})`;
    }
  }

  /**
   * Obtiene el número de tareas pendientes
   */
  getPendingItemsCount(ventas: any[]): number {
    if (!ventas || ventas.length === 0) {
      return 0;
    }
    return ventas.filter(venta => {
      if (!venta) return false;
      // Solo contar las ventas que no han sido recogidas
      return venta.recogido === false;
    }).length;
  }

  updatePendingItemStatus(items: PendingItem[], itemId: number, status: 'pending' | 'in_progress' | 'completed' | 'cancelled'): PendingItem[] {
    const index = items.findIndex(p => p.id === itemId);
    if (index !== -1) {
      items[index].status = status;
    }
    
    return [...items];
  }
}
