import { Injectable, inject, computed } from '@angular/core';
import { InventarioStateService } from '../../inventario/services/inventario-state.service';
import { TodosInventario } from '../../inventario/interfaces/inventario.interface';

export interface StockAlert {
  id: number;
  codigo: string;
  descripcion: string;
  tipo: string;
  stockActual: number;
  stockMinimo: number;
  diferencia: number;
  porcentaje: number;
  prioridad: 'critica' | 'media' | 'baja';
}

@Injectable({
  providedIn: 'root'
})
export class StockAlertsService {
  private inventarioStateService = inject(InventarioStateService);

  /**
   * Obtiene todas las alertas de stock
   */
  getStockAlerts = computed(() => {
    const items = this.inventarioStateService.state().items;
    return this.calculateStockAlerts(items);
  });

  /**
   * Obtiene el número total de alertas de stock
   */
  getStockAlertsCount = computed(() => {
    return this.getStockAlerts().length;
  });

  /**
   * Obtiene alertas por prioridad
   */
  getAlertsByPriority = computed(() => {
    const alerts = this.getStockAlerts();
    return {
      critica: alerts.filter(a => a.prioridad === 'critica').length,
      media: alerts.filter(a => a.prioridad === 'media').length,
      baja: alerts.filter(a => a.prioridad === 'baja').length
    };
  });

  /**
   * Calcula las alertas de stock basado en el inventario
   */
  private calculateStockAlerts(items: TodosInventario[]): StockAlert[] {
    if (!items || items.length === 0) {
      return [];
    }

    return items
      .filter(item => this.isStockLow(item))
      .map(item => this.createStockAlert(item))
      .sort((a, b) => this.sortByPriority(a, b));
  }

  /**
   * Verifica si un item tiene stock bajo
   */
  private isStockLow(item: TodosInventario): boolean {
    return item.stock_global_actual <= item.stock_global_minimo;
  }

  /**
   * Crea una alerta de stock para un item
   */
  private createStockAlert(item: TodosInventario): StockAlert {
    const diferencia = item.stock_global_minimo - item.stock_global_actual;
    const porcentaje = item.stock_global_minimo > 0 
      ? (item.stock_global_actual / item.stock_global_minimo) * 100 
      : 0;

    return {
      id: item.id,
      codigo: item.codigo,
      descripcion: item.descripcion,
      tipo: item.tipo,
      stockActual: item.stock_global_actual,
      stockMinimo: item.stock_global_minimo,
      diferencia,
      porcentaje,
      prioridad: this.calculatePriority(item.stock_global_actual, item.stock_global_minimo, porcentaje)
    };
  }

  /**
   * Calcula la prioridad de la alerta
   */
  private calculatePriority(stockActual: number, stockMinimo: number, porcentaje: number): 'critica' | 'media' | 'baja' {
    if (stockActual <= 0) {
      return 'critica'; // Sin stock
    }
    
    if (porcentaje <= 25) {
      return 'critica'; // 25% o menos del stock mínimo
    }
    
    if (porcentaje <= 50) {
      return 'media'; // Entre 25% y 50% del stock mínimo
    }
    
    return 'baja'; // Entre 50% y 100% del stock mínimo
  }

  /**
   * Ordena las alertas por prioridad
   */
  private sortByPriority(a: StockAlert, b: StockAlert): number {
    const priorityOrder = { critica: 3, media: 2, baja: 1 };
    const priorityDiff = priorityOrder[b.prioridad] - priorityOrder[a.prioridad];
    
    if (priorityDiff !== 0) {
      return priorityDiff;
    }
    
    // Si tienen la misma prioridad, ordenar por porcentaje (menor primero)
    return a.porcentaje - b.porcentaje;
  }

  /**
   * Obtiene alertas críticas únicamente
   */
  getCriticalAlerts = computed(() => {
    return this.getStockAlerts().filter(alert => alert.prioridad === 'critica');
  });

  /**
   * Obtiene el número de alertas críticas
   */
  getCriticalAlertsCount = computed(() => {
    return this.getCriticalAlerts().length;
  });

  /**
   * Método para logging/debugging - muestra el estado actual de las alertas
   */
  logCurrentAlerts(): void {
    const alerts = this.getStockAlerts();
    const summary = this.getAlertsByPriority();
    
    console.group('📊 Stock Alerts Summary');
    console.log(`Total alerts: ${alerts.length}`);
    console.log(`Critical: ${summary.critica}`);
    console.log(`Medium: ${summary.media}`);
    console.log(`Low: ${summary.baja}`);
    
    if (alerts.length > 0) {
      console.table(alerts.map(alert => ({
        Código: alert.codigo,
        Producto: alert.descripcion,
        'Stock Actual': alert.stockActual,
        'Stock Mínimo': alert.stockMinimo,
        'Porcentaje': `${alert.porcentaje.toFixed(1)}%`,
        Prioridad: alert.prioridad
      })));
    }
    
    console.groupEnd();
  }

  /**
   * Refresca los datos del inventario
   */
  refreshInventoryData(): void {
    this.inventarioStateService.refreshData();
  }
}
