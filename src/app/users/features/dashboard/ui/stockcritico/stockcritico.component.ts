import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StockChartService } from '../../services/stock-chart.service';

@Component({
  selector: 'app-stockcritico',
  imports: [CommonModule],
  templateUrl: './stockcritico.component.html',
  styleUrl: './stockcritico.component.css'
})
export class StockcriticoComponent {
  private stockChartService = inject(StockChartService);

  // Signals reactivos para los datos de resumen (ahora obtienen datos directamente por API)
  stockChartData = this.stockChartService.getStockChartData;
  hasData = this.stockChartService.hasData;
  criticalStats = this.stockChartService.getCriticalStockStats;
  restockRecommendations = this.stockChartService.getRestockRecommendations;

  /**
   * Formatea números para mostrar
   */
  formatNumber(value: number): string {
    if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    return value.toString();
  }

  /**
   * Obtiene el color de estado para un tipo de stock
   */
  getStatusColor(stockActual: number, stockMinimo: number): string {
    if (stockActual <= 0) return 'text-red-600';
    if (stockActual <= stockMinimo) return 'text-orange-600';
    if (stockActual <= stockMinimo * 1.5) return 'text-yellow-600';
    return 'text-green-600';
  }

  /**
   * Obtiene el mensaje de estado para un tipo de stock
   */
  getStatusMessage(stockActual: number, stockMinimo: number): string {
    if (stockActual <= 0) return 'Sin stock';
    if (stockActual <= stockMinimo) return '¡Crítico!';
    if (stockActual <= stockMinimo * 1.5) return 'Bajo';
    return 'OK';
  }

  /**
   * Obtiene el porcentaje de completitud del stock para el indicador de progreso
   */
  getCompletenessPercentage(stockActual: number, stockMinimo: number): number {
    if (stockMinimo <= 0) return 0;
    return Math.min((stockActual / stockMinimo) * 100, 100);
  }
}
