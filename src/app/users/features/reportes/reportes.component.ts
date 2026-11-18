import { Component, inject, OnInit, signal, ViewEncapsulation, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopbarComponent } from "../../../shared/ui/layout/topbar/topbar.component";
import { LayoutComponent } from "../../../shared/ui/layout/layout.component";
import { ReporteanteriorComponent } from "../../../shared/ui/reporteanterior/reporteanterior.component";
import { VisorReciboComponent } from "../../../shared/components/visor-recibo/visor-recibo.component";
import { CajaDiariaStateService } from './services/caja-diaria-state.service';
import { CajaDiariaService, VentaDetallada } from './services/caja-diaria.service';
import { FormasPagoStateService } from '../../services/formaspago-state.service';
import { FormaPago } from '../../interfaces/formapago.interface';
import { AuthStateService } from '../../../auth/services/auth-state.service';
import { TipoVentaCase } from '../../../shared/ui/pending-list/interfaces/pending-item.interface';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-reportes',
  imports: [
    CommonModule,
    TopbarComponent, 
    LayoutComponent, 
    ReporteanteriorComponent,
    VisorReciboComponent
  ],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.css',
  encapsulation: ViewEncapsulation.None
})
export class ReportesComponent implements OnInit {
  private authStateService = inject(AuthStateService);
  private cajaDiariaStateService = inject(CajaDiariaStateService);
  private cajaDiariaService = inject(CajaDiariaService);
  private formasPagoStateService = inject(FormasPagoStateService);

  // Signals reactivos desde el state service
  ventasDelDia = this.cajaDiariaStateService.state.ventas;
  resumenCaja = this.cajaDiariaStateService.state.resumenCaja;
  loading = this.cajaDiariaStateService.state.status;
  error = this.cajaDiariaStateService.state.error;
  reciboHtml = this.cajaDiariaStateService.state.reciboHtml;
  reciboLoading = this.cajaDiariaStateService.state.reciboLoading;
  cajaCerrada = this.cajaDiariaStateService.state.cajaCerrada;
  mensajeCierre = this.cajaDiariaStateService.state.mensajeCierre;
  
  // Signal de formas de pago
  formasPagoState = this.formasPagoStateService.state;
  
  // Estado del modal de cierre y visor de recibo
  mostrarModalCierre = signal(false);
  mostrarVisorRecibo = signal(false);
  ventaIdActual = signal<number | null>(null);
  observacionesCierre = signal<string>('');
  accionEnProceso = signal<number | null>(null);
  
  // Fecha actual formateada
  fechaHoy = new Date().toLocaleDateString('es-ES', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Computed signals para las dos tablas separadas
  ventasCompletadasDelDia = computed(() => {
    const todasLasVentas = this.ventasDelDia();
    const hoy = new Date().toDateString();
    
    return todasLasVentas.filter(venta => {
      // Solo ventas recogidas (completadas) del día de hoy
      const esRecogida = venta.recogido === true;
      const fechaVenta = new Date(venta.fecha || venta.created_at || '').toDateString();
      const esDelDiaDeHoy = fechaVenta === hoy;
      
      return esRecogida && esDelDiaDeHoy;
    });
  });

  ventasPendientes = this.cajaDiariaStateService.state.ventasPendientesTodas;

  constructor() {
    // Debug: Observar cambios en las ventas usando effect
    effect(() => {
      const ventas = this.ventasDelDia();
      console.log('📈 Ventas del día actualizadas:', ventas);
      console.log('📊 Cantidad de ventas:', ventas.length);
      if (ventas.length > 0) {
        console.log('🔎 Primera venta:', ventas[0]);
        console.log('🔎 Última venta:', ventas[ventas.length - 1]);
        ventas.forEach((venta, index) => {
          console.log(`🔍 Venta ${index + 1}:`, {
            id: venta.id,
            cliente: venta.cliente,
            fecha: venta.fecha,
            precioTotal: venta.precioTotal,
            saldo: venta.saldo,
            estado: venta.estado,
            productos: venta.productos
          });
        });
      }
    });
  }

  ngOnInit() {
    console.log('📊 Inicializando ReportesComponent...');
    this.formasPagoStateService.refreshData();
    this.cargarVentasDelDia();
  }

  /**
   * Carga las ventas del día actual
   */
  cargarVentasDelDia() {
    if (!this.authStateService.validateUserAndRedirect()) {
      return;
    }
    
    console.log('🔍 Cargando ventas del día...');
    this.cajaDiariaStateService.cargarVentasDelDia();
  }

  /**
   * Abre el modal de confirmación para cierre de caja
   */
  abrirModalCierre() {
    if (!this.authStateService.validateUserAndRedirect()) {
      return;
    }

    // Verificar si la caja ya está cerrada
    if (this.cajaCerrada()) {
      alert('La caja de este día ya ha sido cerrada. No se pueden realizar modificaciones.');
      return;
    }
    
    this.mostrarModalCierre.set(true);
  }

  /**
   * Realiza el cierre de caja diario
   */
  confirmarCierreCaja() {
    if (!this.authStateService.validateUserAndRedirect()) {
      return;
    }
    
    this.cajaDiariaStateService.realizarCierreCaja(this.observacionesCierre());
    this.mostrarModalCierre.set(false);
    this.observacionesCierre.set('');
  }

  /**
   * Cancela el cierre de caja
   */
  cancelarCierre() {
    this.mostrarModalCierre.set(false);
    this.observacionesCierre.set('');
  }

  /**
   * Verifica si la caja del día actual está cerrada
   */
  get isCajaCerrada() {
    return this.cajaCerrada();
  }

  /**
   * Obtiene el mensaje de cierre de caja
   */
  get mensajeCierreCaja() {
    return this.mensajeCierre();
  }

  /**
   * Verifica si se pueden realizar modificaciones (caja no cerrada)
   */
  get puedeRealizarModificaciones() {
    return !this.cajaCerrada();
  }

  /**
   * Verifica si está en proceso de cierre
   */
  get cierreEnProceso() {
    return this.cajaDiariaStateService.state.cierreEnProceso;
  }

  /**
   * Verifica si está cargando
   */
  get isLoading() {
    return this.loading() === 'loading';
  }

  /**
   * Abre el visor de recibo para una venta
   */
  verRecibo(venta: VentaDetallada) {
    if (!this.authStateService.validateUserAndRedirect()) {
      return;
    }
    
    if (venta.id) {
      this.ventaIdActual.set(venta.id);
    } else {
      // Si no hay ID, generar un ID temporal basado en el índice
      console.log("No hay ID");
      const index = this.ventasDelDia().indexOf(venta);
      const ventaId = index + 1; // ID temporal basado en posición
      this.ventaIdActual.set(ventaId);
    }
    this.mostrarVisorRecibo.set(true);
  }

  /**
   * Cierra el visor de recibo
   */
  cerrarVisorRecibo() {
    this.mostrarVisorRecibo.set(false);
    this.ventaIdActual.set(null);
  }

  /**
   * Determina el tipo de venta (sin adelanto / con adelanto / completada)
   * Ya no distingue entre marcos y productos — es una orden de venta unificada.
   */
  determinarTipoVenta(venta: VentaDetallada): TipoVentaCase {
    const totalVenta = venta.precioTotal || 0;
    const saldoPagado = venta.saldo || 0;
    const recogido = venta.recogido === true;

    if (recogido) return 'venta_completada';

    if (saldoPagado === 0) return 'preventa_sin_adelanto';
    if (saldoPagado > 0 && saldoPagado < totalVenta) return 'preventa_con_adelanto';

    return 'desconocido';
  }

  getTipoVentaLabel(tipoVenta: TipoVentaCase): string {
    const labels: Partial<Record<TipoVentaCase, string>> = {
      'preventa_sin_adelanto': 'Sin Adelanto',
      'preventa_con_adelanto': 'Con Adelanto',
      'venta_completada': 'Completada',
      'desconocido': 'Desconocido'
    };
    return labels[tipoVenta] ?? tipoVenta;
  }

  getTipoVentaClass(tipoVenta: TipoVentaCase): string {
    const classes: Partial<Record<TipoVentaCase, string>> = {
      'preventa_sin_adelanto': 'bg-yellow-100 text-yellow-800',
      'preventa_con_adelanto': 'bg-orange-100 text-orange-800',
      'venta_completada': 'bg-green-100 text-green-800',
      'desconocido': 'bg-gray-100 text-gray-800'
    };
    return classes[tipoVenta] ?? 'bg-gray-100 text-gray-800';
  }

  getTipoVentaIcon(tipoVenta: TipoVentaCase): string {
    const icons: Partial<Record<TipoVentaCase, string>> = {
      'preventa_sin_adelanto': 'fas fa-clock',
      'preventa_con_adelanto': 'fas fa-coins',
      'venta_completada': 'fas fa-check-circle',
      'desconocido': 'fas fa-question-circle'
    };
    return icons[tipoVenta] ?? 'fas fa-circle';
  }

  /**
   * Obtiene el color del estado de la venta (actualizado con casos)
   */
  getEstadoColor(venta: VentaDetallada): string {
    const tipoVenta = this.determinarTipoVenta(venta);
    return this.getTipoVentaClass(tipoVenta);
  }

  /**
   * Obtiene el texto del estado basado en el tipo de venta
   */
  getEstadoTexto(venta: VentaDetallada): string {
    const tipoVenta = this.determinarTipoVenta(venta);
    return this.getTipoVentaLabel(tipoVenta);
  }

  /**
   * Formatea el total en bolivianos
   */
  formatearTotal(total: number): string {
    return `Bs ${total.toFixed(2)}`;
  }

  /**
   * Obtiene estadísticas por casos de venta específicos
   * ACTUALIZADO: Usa ventas completadas del día + todas las pendientes
   */
  get estadisticasPorCasosVenta() {
    const ventasCompletadasDelDia = this.ventasCompletadasDelDia();
    const todasLasVentasPendientes = this.ventasPendientes();

    const conAdelanto = todasLasVentasPendientes.filter((v: any) => this.determinarTipoVenta(v) === 'preventa_con_adelanto');
    const sinAdelanto = todasLasVentasPendientes.filter((v: any) => this.determinarTipoVenta(v) === 'preventa_sin_adelanto');

    return [
      {
        tipo: 'venta_completada' as TipoVentaCase,
        titulo: 'Ventas Completadas',
        icono: 'fas fa-check-circle',
        color: 'green',
        cantidad: ventasCompletadasDelDia.length,
        total: ventasCompletadasDelDia.reduce((sum: number, v: any) => sum + (v.precioTotal || v.total || 0), 0),
        descripcion: 'Pagadas y entregadas'
      },
      {
        tipo: 'preventa_con_adelanto' as TipoVentaCase,
        titulo: 'Órdenes con Adelanto',
        icono: 'fas fa-coins',
        color: 'orange',
        cantidad: conAdelanto.length,
        total: conAdelanto.reduce((sum: number, v: any) => sum + (v.saldo || 0), 0),
        descripcion: 'Con adelanto parcial'
      },
      {
        tipo: 'preventa_sin_adelanto' as TipoVentaCase,
        titulo: 'Órdenes Sin Adelanto',
        icono: 'fas fa-clock',
        color: 'yellow',
        cantidad: sinAdelanto.length,
        total: 0,
        descripcion: 'Por cobrar al entregar'
      }
    ];
  }
    
  /**
   * Obtiene estadísticas por forma de pago (para referencia legacy)
   * Usa id_forma_pago real del API para determinar las ventas por forma de pago
   */
  get estadisticasPorFormaPago() {
    const formasPago = this.formasPagoState().formasPago.filter(fp => fp.activo);
    const ventasCompletadas = this.ventasDelDia().filter(v => v.estado.toLowerCase() === 'completado');
    
    // Generar estadísticas usando id_forma_pago real
    const todasLasEstadisticas = formasPago.map(formaPago => {
      // Filtrar ventas que coincidan con el id_forma_pago
      const ventasDeEstaFormaPago = ventasCompletadas.filter(venta => {
        return venta.id_forma_pago === formaPago.id;
      });
      
      const total = ventasDeEstaFormaPago.reduce((sum, venta) => sum + venta.total, 0);
      const cantidad = ventasDeEstaFormaPago.length;
      
      return {
        formaPago,
        total,
        cantidad,
        color: this.getColorParaFormaPago(formaPago.nombre),
        icono: this.getIconoParaFormaPago(formaPago.nombre)
      };
    });
    
    // Ordenar por total descendente y tomar las top 3
    const topFormasPago = todasLasEstadisticas
      .filter(e => e.total > 0 || e.cantidad > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 3);
    
    // Si no hay suficientes formas de pago con ventas, agregar las primeras formas de pago disponibles
    while (topFormasPago.length < 3 && topFormasPago.length < formasPago.length) {
      const formaPagoFaltante = formasPago.find(fp => 
        !topFormasPago.some(top => top.formaPago.id === fp.id)
      );
      
      if (formaPagoFaltante) {
        topFormasPago.push({
          formaPago: formaPagoFaltante,
          total: 0,
          cantidad: 0,
          color: this.getColorParaFormaPago(formaPagoFaltante.nombre),
          icono: this.getIconoParaFormaPago(formaPagoFaltante.nombre)
        });
      } else {
        break;
      }
    }
    
    // Agregar estadística de preventas/pendientes (saldo > 0)
    const ventasPendientes = this.ventasDelDia().filter(v => v.estado.toLowerCase() === 'pendiente');
    const totalPreventas = ventasPendientes.reduce((sum, venta) => sum + (venta.precioTotal - venta.saldo), 0);
    
    topFormasPago.push({
      formaPago: { 
        nombre: 'Preventas', 
        descripcion: 'Ventas pendientes por completar',
        id: -1 // ID especial para preventas
      } as FormaPago,
      total: totalPreventas, // Total de adelantos en preventas
      cantidad: ventasPendientes.length,
      color: 'orange',
      icono: 'fas fa-clock'
    });
    
    return topFormasPago;
  }

  /**
   * Obtiene el color para una forma de pago
   */
  private getColorParaFormaPago(nombre: string): string {
    const nombreLower = nombre.toLowerCase();
    if (nombreLower.includes('efectivo') || nombreLower.includes('cash')) {
      return 'green';
    } else if (nombreLower.includes('qr') || nombreLower.includes('digital')) {
      return 'purple';
    } else if (nombreLower.includes('tarjeta') || nombreLower.includes('card')) {
      return 'blue';
    } else if (nombreLower.includes('transferencia')) {
      return 'indigo';
    }
    return 'gray';
  }

  /**
   * Obtiene el icono para una forma de pago
   */
  private getIconoParaFormaPago(nombre: string): string {
    const nombreLower = nombre.toLowerCase();
    if (nombreLower.includes('efectivo') || nombreLower.includes('cash')) {
      return 'fas fa-money-bill-wave';
    } else if (nombreLower.includes('qr')) {
      return 'fas fa-qrcode';
    } else if (nombreLower.includes('digital') || nombreLower.includes('transferencia')) {
      return 'fas fa-mobile-alt';
    } else if (nombreLower.includes('tarjeta') || nombreLower.includes('card')) {
      return 'fas fa-credit-card';
    }
    return 'fas fa-coins';
  }

  /**
   * Formatea una fecha para mostrar en la tabla de pendientes
   */
  formatearFecha(fechaString: string): string {
    if (!fechaString) {
      return 'Sin fecha';
    }
    
    try {
      const fecha = new Date(fechaString);
      if (isNaN(fecha.getTime())) {
        return 'Fecha inválida';
      }
      
      return fecha.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return 'Error en fecha';
    }
  }

  /**
   * Anula una venta
   */
  anularVenta(venta: VentaDetallada) {
    if (!this.authStateService.validateUserAndRedirect()) return;
    if (!confirm(`¿Está seguro que desea ANULAR la venta de ${venta.cliente}? Esta acción no se puede deshacer.`)) return;

    this.accionEnProceso.set(venta.id);
    this.cajaDiariaService.anularVenta(venta.id).subscribe({
      next: () => {
        this.accionEnProceso.set(null);
        this.cargarVentasDelDia();
      },
      error: (err) => {
        this.accionEnProceso.set(null);
        alert(`Error al anular la venta: ${err?.error?.message || err?.message || 'Error desconocido'}`);
      }
    });
  }

  /**
   * Registra la devolución de una venta
   */
  devolverVenta(venta: VentaDetallada) {
    if (!this.authStateService.validateUserAndRedirect()) return;
    if (!confirm(`¿Está seguro que desea registrar la DEVOLUCIÓN de la venta de ${venta.cliente}?`)) return;

    this.accionEnProceso.set(venta.id);
    this.cajaDiariaService.devolverVenta(venta.id).subscribe({
      next: () => {
        this.accionEnProceso.set(null);
        this.cargarVentasDelDia();
      },
      error: (err) => {
        this.accionEnProceso.set(null);
        alert(`Error al registrar la devolución: ${err?.error?.message || err?.message || 'Error desconocido'}`);
      }
    });
  }
}
