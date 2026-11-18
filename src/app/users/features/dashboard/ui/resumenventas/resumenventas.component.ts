import { Component, OnInit, OnDestroy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { VentasStateService } from '../../../ventas/services/ventas-state.service';
import { PendingItemsService } from '../../../ventas/services/pending-items.service';
import { StockAlertsService } from '../../services/stock-alerts.service';

@Component({
  selector: 'app-resumenventas',
  imports: [CommonModule],
  templateUrl: './resumenventas.component.html',
  styleUrl: './resumenventas.component.css'
})
export class ResumenventasComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Servicios inyectados usando inject()
  private ventasStateService = inject(VentasStateService);
  private pendingItemsService = inject(PendingItemsService);
  private stockAlertsService = inject(StockAlertsService);
  
  /**
   * Datos del resumen de ventas usando signals
   */
  ventasTotales = this.ventasStateService.getVentasTotalSignal();
  pedidosPendientes = computed(() => 
    this.pendingItemsService.getPendingItemsCount(this.ventasStateService.state().ventas)
  );
  
  /**
   * Alertas de stock calculadas reactivamente
   */
  alertasStock = this.stockAlertsService.getStockAlertsCount;
  alertasCriticas = this.stockAlertsService.getCriticalAlertsCount;
  alertasPorPrioridad = this.stockAlertsService.getAlertsByPriority;

  ngOnInit(): void {
    // Cargar datos iniciales
    this.ventasStateService.refreshData();
    this.stockAlertsService.refreshInventoryData();
    
    // Para debugging - mostrar alertas en consola
    if (typeof window !== 'undefined' && window.console) {
      setTimeout(() => {
        this.stockAlertsService.logCurrentAlerts();
      }, 2000);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Formatea el valor de ventas totales
   * @param valor Valor a formatear
   * @returns Valor formateado
   */
  formatearVentasTotales(valor: number): string {
    if (valor >= 1000000) {
      return `$${(valor / 1000000).toFixed(1)}M`;
    } else if (valor >= 1000) {
      return `$${(valor / 1000).toFixed(1)}k`;
    } else {
      return `$${valor.toFixed(0)}`;
    }
  }

  /**
   * Obtiene la clase CSS para las alertas según la prioridad
   */
  getAlertClass(): string {
    const alertasCriticas = this.alertasCriticas();
    
    if (alertasCriticas > 0) {
      return 'text-red-600'; // Críticas
    }
    
    const totalAlertas = this.alertasStock();
    if (totalAlertas > 0) {
      return 'text-orange-600'; // Medias/Bajas
    }
    
    return 'text-green-600'; // Sin alertas
  }

  /**
   * Obtiene el mensaje descriptivo de las alertas
   */
  getAlertMessage(): string {
    const alertasCriticas = this.alertasCriticas();
    const totalAlertas = this.alertasStock();
    
    if (alertasCriticas > 0) {
      return `${alertasCriticas} críticas de ${totalAlertas} totales`;
    }
    
    if (totalAlertas > 0) {
      return `${totalAlertas} productos con stock bajo`;
    }
    
    return 'Stock normal en todos los productos';
  }

  /**
   * Obtiene el icono apropiado según el estado de las alertas
   */
  getAlertIcon(): string {
    const alertasCriticas = this.alertasCriticas();
    const totalAlertas = this.alertasStock();
    
    if (alertasCriticas > 0) {
      return 'fas fa-exclamation-triangle';
    }
    
    if (totalAlertas > 0) {
      return 'fas fa-exclamation-circle';
    }
    
    return 'fas fa-check-circle';
  }

  /**
   * Obtiene información detallada de las alertas por prioridad
   */
  getDetailedAlertInfo(): string {
    const alertasPorPrioridad = this.alertasPorPrioridad();
    const criticas = alertasPorPrioridad.critica;
    const medias = alertasPorPrioridad.media;
    const bajas = alertasPorPrioridad.baja;
    
    if (criticas > 0) {
      return `${criticas} críticas, ${medias} medias, ${bajas} bajas`;
    }
    
    if (medias > 0 || bajas > 0) {
      return `${medias} medias, ${bajas} bajas`;
    }
    
    return 'Todos los productos con stock normal';
  }
}
