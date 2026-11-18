import { Injectable, inject, computed } from '@angular/core';
import { InventarioService } from '../../inventario/services/inventario.service';
import { Producto } from '../../inventario/interfaces/producto.interface';
import { forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';

export interface StockSummaryData {
  tipo: string;
  stockActual: number;
  stockMinimo: number;
  color: string;
  label: string;
}

@Injectable({
  providedIn: 'root'
})
export class StockChartService {
  private inventarioService = inject(InventarioService);

  // Configuración de tipos de productos
  private readonly PRODUCT_TYPES = [
    { tipo: 'producto', label: 'Productos', color: '#3B82F6' }
  ];

  /**
   * Obtiene todos los datos de inventario por tipo usando las APIs específicas
   */
  private getAllInventoryData$ = forkJoin({
    productos: this.inventarioService.getProductos().pipe(
      catchError(() => of([]))
    )
  }).pipe(
    map(data => this.calculateStockByType(data))
  );

  /**
   * Signal que contiene los datos del stock por tipo para los cuadros de resumen
   */
  getStockChartData = toSignal(this.getAllInventoryData$, { 
    initialValue: this.getExampleData()
  });

  /**
   * Calcula el stock total por tipo de producto usando datos específicos por tipo
   */
  private calculateStockByType(data: {
    productos: Producto[];
  }): StockSummaryData[] {
    return this.PRODUCT_TYPES.map(type => {
      let totalStockActual = 0;
      let totalStockMinimo = 0;

      switch (type.tipo) {
        case 'producto':
          totalStockActual = data.productos.reduce((sum, item) => 
            sum + (item.stock_global_actual || 0), 0);
          totalStockMinimo = data.productos.reduce((sum, item) => 
            sum + (item.stock_global_minimo || 0), 0);
          break;
      }

      return {
        tipo: type.tipo,
        stockActual: totalStockActual,
        stockMinimo: totalStockMinimo,
        color: type.color,
        label: type.label
      };
    });
  }

  /**
   * Obtiene datos de ejemplo para visualización inicial
   */
  private getExampleData(): StockSummaryData[] {
    return this.PRODUCT_TYPES.map((type, index) => ({
      tipo: type.tipo,
      stockActual: (index + 1) * 15, // 15, 30, 45, 60, 75
      stockMinimo: (index + 1) * 12,  // 12, 24, 36, 48, 60
      color: type.color,
      label: type.label
    }));
  }

  /**
   * Verifica si hay datos para mostrar
   */
  hasData = computed(() => {
    const data = this.getStockChartData();
    return data && data.length > 0;
  });

  /**
   * Obtiene estadísticas del stock crítico
   */
  getCriticalStockStats = computed(() => {
    const data = this.getStockChartData();
    if (!data) return { totalTypes: 0, typesWithStock: 0, typesWithCriticalStock: 0 };
    
    return {
      totalTypes: data.length,
      typesWithStock: data.filter((item: StockSummaryData) => item.stockActual > 0).length,
      typesWithCriticalStock: data.filter((item: StockSummaryData) => 
        item.stockActual > 0 && item.stockActual <= item.stockMinimo).length
    };
  });

  /**
   * Obtiene recomendaciones de reabastecimiento
   */
  getRestockRecommendations = computed(() => {
    const data = this.getStockChartData();
    if (!data) return [];
    
    return data
      .filter((item: StockSummaryData) => item.stockActual <= item.stockMinimo && item.stockMinimo > 0)
      .map((item: StockSummaryData) => ({
        tipo: item.tipo,
        label: item.label,
        stockActual: item.stockActual,
        stockMinimo: item.stockMinimo,
        cantidadSugerida: Math.max(item.stockMinimo - item.stockActual, 0),
        prioridad: this.calculateRestockPriority(item.stockActual, item.stockMinimo)
      }))
      .sort((a: any, b: any) => this.sortRestockPriority(a.prioridad, b.prioridad));
  });

  /**
   * Calcula la prioridad de reabastecimiento
   */
  private calculateRestockPriority(actual: number, minimo: number): 'alta' | 'media' | 'baja' {
    if (actual <= 0) return 'alta';
    if (actual <= minimo * 0.5) return 'alta';
    if (actual <= minimo * 0.8) return 'media';
    return 'baja';
  }

  /**
   * Ordena por prioridad de reabastecimiento
   */
  private sortRestockPriority(a: 'alta' | 'media' | 'baja', b: 'alta' | 'media' | 'baja'): number {
    const priority = { 'alta': 3, 'media': 2, 'baja': 1 };
    return priority[b] - priority[a];
  }
}
