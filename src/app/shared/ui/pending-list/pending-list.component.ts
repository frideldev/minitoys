import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PendingItem, PendingType, PendingStatus, PendingPriority, PendingConfig, TipoVentaCase } from './interfaces/pending-item.interface';
import { FormasPagoStateService } from '../../../users/services/formaspago-state.service';
import { FormaPago } from '../../../users/interfaces/formapago.interface';
import { VentasStateService } from '../../../users/features/ventas/services/ventas-state.service';
import { ClientesStateService } from '../../../users/services/clientes-state.service';
import { Venta } from '../../../users/features/ventas/interfaces/venta.interface';
import { PriceUtils } from '../../utils/price.utils';

@Component({
  selector: 'app-pending-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pending-list.component.html',
  styleUrl: './pending-list.component.css'
})
export class PendingListComponent implements OnInit, OnDestroy {
  private formasPagoStateService = inject(FormasPagoStateService);
  private ventasStateService = inject(VentasStateService);
  private clientesStateService = inject(ClientesStateService);

  // 🔥 Effect para detectar cambios automáticamente en las ventas
  private ventasUpdateEffect = effect(() => {
    const ventasState = this.ventasState();
    
    // Solo necesitamos que las ventas estén cargadas — el cliente viene embebido en cada venta
    if (ventasState.status === 'success') {
      console.log('🔄 [PendingList] Detectado cambio en ventas, actualizando lista...');
      this.updatePendingItemsFromState(ventasState.ventas);
    }
    
    if (ventasState.status === 'loading') {
      console.log('⏳ [PendingList] Cargando ventas...');
    }
    if (ventasState.error) {
      console.error('❌ [PendingList] Error al cargar ventas:', ventasState.error);
    }
  });
  
  @Input() config: PendingConfig = {
    title: 'Pendientes',
    showFilters: true,
    showSearch: true,
    allowActions: true,
    itemsPerPage: 10,
    enablePagination: true
  };

  @Output() itemClick = new EventEmitter<PendingItem>();
  @Output() actionClick = new EventEmitter<{ action: string; item: PendingItem; formaPagoId?: number }>();

  protected formasPagoState = this.formasPagoStateService.state;
  protected ventasState = this.ventasStateService.state;
  protected clientesState = this.clientesStateService.state;
  
  // Signal para los items pendientes cargados desde API
  pendingItems = signal<PendingItem[]>([]);
  
  // Modal para selección de forma de pago
  showPaymentModal = false;
  selectedItemForPayment: PendingItem | null = null;
  selectedFormaPagoId: number | null = null;

  filteredItems: PendingItem[] = [];
  searchTerm = '';
  selectedPriority: 'all' | PendingPriority = 'all';

  // Pagination
  currentPage = 1;
  totalPages = 1;

  // Getter for pagination display
  get paginationEndItem(): number {
    return Math.min(this.currentPage * this.config.itemsPerPage, this.filteredItems.length);
  }

  ngOnInit() {
    console.log('🚀 [PendingList] Inicializando componente...');
    this.formasPagoStateService.refreshData();
    this.clientesStateService.refreshData();
    
    // Cargar datos iniciales
    this.loadPendingItemsFromAPI();
  }

  ngOnDestroy() {
    // El effect se limpia automáticamente al destruir el componente
    console.log('🔚 [PendingList] Componente destruido');
  }

  /**
   * Actualiza los pending items desde el estado actual (llamado por el effect)
   */
  private updatePendingItemsFromState(ventas: Venta[]) {
    console.log('🔄 [PendingList] Actualizando desde estado:', { totalVentas: ventas.length });
    
    const pendingItems = this.convertVentasToPendingItems(ventas);
    this.pendingItems.set(pendingItems);
    this.applyFilters();
    
    console.log('✅ [PendingList] Lista actualizada con', pendingItems.length, 'items');
  }

  /**
   * Carga los items pendientes desde el API ventaProductoMarco (carga inicial)
   */
  loadPendingItemsFromAPI() {
    console.log('📥 [PendingList] Carga inicial de datos...');
    
    // Forzar recarga de datos desde el servidor
    this.ventasStateService.refreshData();
    
    // Los datos se actualizarán automáticamente via effect
    // cuando el estado cambie de 'loading' a 'success'
  }

  /**
   * Método público para forzar actualización (para uso externo si es necesario)
   */
  public forceRefresh() {
    console.log('🔄 [PendingList] Forzando actualización manual...');
    this.loadPendingItemsFromAPI();
  }

  /**
   * Convierte ventas del API a PendingItems
   */
  convertVentasToPendingItems(ventas: Venta[]): PendingItem[] {
    if (!ventas || ventas.length === 0) {
      console.log('🔍 [PendingList] No hay ventas para convertir');
      return [];
    }

    console.log('🔍 [PendingList] Total ventas recibidas:', ventas.length);
    
    // FILTRO MEJORADO: Solo ventas realmente pendientes
    const ventasPendientes = ventas.filter(venta => {
      const recogido = venta.recogido === true;
      const totalVenta = PriceUtils.fromApi(venta.precioTotal || 0);
      const saldoPagado = PriceUtils.fromApi(venta.saldo || 0);
      
      console.log(`🔍 [Filtro] Venta ${venta.id}: recogido=${recogido}, saldo=${saldoPagado}, total=${totalVenta}, tieneMarcos=${!!(venta.detalle_venta_personalizadas?.length)}, tieneProductos=${!!(venta.detalle_venta_productos?.length)}`);
      
      // Excluir si está recogido = true (completado)
      if (recogido) {
        console.log(`🚫 [Filtro] Excluyendo venta ${venta.id} - recogido: ${recogido}`);
        return false;
      }
      
      // Excluir si el saldo pagado es igual o mayor al total (venta completada, solo falta recoger)
      // Esto podría ser opcional dependiendo del negocio, comentar si se quiere incluir
      if (saldoPagado >= totalVenta && totalVenta > 0) {
        console.log(`⚠️ [PendingList] Venta ${venta.id} pagada completa pero no recogida (saldo: ${saldoPagado}, total: ${totalVenta})`);
        // return false; // Descomentar para excluir ventas pagadas pero no recogidas
      }
      
      return true; // Solo ventas con recogido = false
    });
    
    console.log('🔍 [PendingList] Ventas pendientes filtradas:', ventasPendientes.length);

    // Convertir a PendingItems y filtrar ventas completadas
    const pendingItems = ventasPendientes.map((venta, index) => {
      // Usar cliente embebido en la venta directamente (viene del API)
      const clienteEmbebido = venta.cliente;
      const clienteInfo = clienteEmbebido
        ? `${clienteEmbebido.nombre} ${clienteEmbebido.apellido}${clienteEmbebido.telefono ? ' - ' + clienteEmbebido.telefono : ''}`
        : `Cliente ID: ${venta.idCliente || 'N/A'}`;
      const clienteNombre = clienteEmbebido
        ? `${clienteEmbebido.nombre} ${clienteEmbebido.apellido}`
        : `Cliente ${venta.idCliente || 'N/A'}`;
      
      // Determinar categoría basada en arrays de detalle
      const tieneProductos = venta.detalle_venta_productos && venta.detalle_venta_productos.length > 0;
      const tieneMarcos = venta.detalle_venta_personalizadas && venta.detalle_venta_personalizadas.length > 0;
      
      let categoria: 'productos' | 'marcos' | 'mixto';
      if (tieneProductos && tieneMarcos) {
        categoria = 'mixto';
      } else if (tieneProductos) {
        categoria = 'productos';
      } else if (tieneMarcos) {
        categoria = 'marcos';
      } else {
        categoria = 'productos'; // fallback
      }
      
      console.log(`📊 [Categoria] Venta ${venta.id}: productos=${venta.detalle_venta_productos?.length || 0}, marcos=${venta.detalle_venta_personalizadas?.length || 0} → ${categoria}`);
      
      // NUEVA LÓGICA: Determinar el tipo de venta según los casos implementados
      const tipoVenta = this.determinarTipoVenta(venta, categoria);
      
      // Calcular totales (normalizar de centavos a Bs)
      const totalVenta = PriceUtils.fromApi(venta.precioTotal || 0);
      const saldoPendiente = PriceUtils.fromApi(venta.saldo || 0);
      const saldoFaltante = totalVenta - saldoPendiente;
      
      const fechaFormateada = this.formatVentaDate(venta);
      
      return {
        id: venta.id,
        type: 'preventa' as const,
        title: this.buildTitle(tipoVenta, venta.id),
        subtitle: clienteInfo,
        description: this.buildDescriptionWithCase(tipoVenta, categoria, totalVenta, saldoPendiente, saldoFaltante, fechaFormateada),
        status: this.getStatusByCase(tipoVenta, saldoFaltante),
        priority: this.getPriorityByCase(venta, tipoVenta),
        date: fechaFormateada,
        amount: saldoFaltante,
        clientName: clienteNombre,
        categoria,
        tipoVenta,
        metadata: {
          preventaId: venta.id,
          sucursalId: venta.idSucursal,
          fechaOriginal: venta.fecha || venta.created_at,
          totalProductos: venta.detalle_venta_productos?.length || 0,
          totalMarcos: venta.detalle_venta_personalizadas?.length || 0,
          totalVenta,
          saldoPagado: saldoPendiente,
          saldoFaltante,
          idFormaPago: (venta as any).idFormaPago || (venta as any).id_forma_pago,
          cliente: clienteEmbebido ? {
            id: clienteEmbebido.id,
            nombre: clienteEmbebido.nombre,
            apellido: clienteEmbebido.apellido,
            telefono: clienteEmbebido.telefono
          } : null
        }
      };
    });

    // FILTRO FINAL: Excluir ventas que se clasificaron como completadas
    const finalPendingItems = pendingItems.filter(item => {
      if (item.tipoVenta === 'venta_completada') {
        console.log(`🚫 [PendingList] Excluyendo venta completada: ${item.id} (${item.tipoVenta})`);
        return false;
      }
      return true;
    });

    console.log('✅ [PendingList] Items pendientes finales:', finalPendingItems.length);
    return finalPendingItems;
  }

  /**
   * Determina el tipo de venta según los casos de negocio implementados
   * ACTUALIZADO: Ya no se basa en formaPagoId=0 ya que siempre se envía un ID válido
   */
  private determinarTipoVenta(venta: Venta, categoria: 'productos' | 'marcos' | 'mixto'): TipoVentaCase {
    const totalVenta = PriceUtils.fromApi(venta.precioTotal || 0);
    const saldoPagado = PriceUtils.fromApi(venta.saldo || 0);
    
    console.log(`🔍 [TipoVenta] ID:${venta.id} Total:${totalVenta} Saldo:${saldoPagado} Recogido:${venta.recogido} Categoria:${categoria}`);
    
    // Si está recogido, es venta completada (no debería aparecer aquí)
    if (venta.recogido === true) {
      return 'venta_completada';
    }
    
    // NUEVA LÓGICA: Determinar casos basándose solo en saldoPagado
    let tipoVenta: TipoVentaCase;
    
    if (saldoPagado === 0) {
      // Casos 2 y 4: Sin adelanto (saldo = 0)
      tipoVenta = categoria === 'marcos' || categoria === 'mixto' ? 'marco_sin_adelanto' : 'preventa_sin_adelanto';
    } else if (saldoPagado > 0 && saldoPagado < totalVenta) {
      // Casos 3 y 5: Con adelanto parcial (0 < saldo < total)
      tipoVenta = categoria === 'marcos' || categoria === 'mixto' ? 'marco_con_adelanto' : 'preventa_con_adelanto';
    } else if (saldoPagado >= totalVenta) {
      // Casos 1 y 6: Pago completo (saldo >= total) - no debería estar en pendientes
      tipoVenta = 'venta_completada';
    } else {
      tipoVenta = 'desconocido';
    }
    
    console.log(`✅ [TipoVenta] ID:${venta.id} → ${tipoVenta}`);
    return tipoVenta;
  }

  /**
   * Construye el título basado en el tipo de venta
   */
  private buildTitle(tipoVenta: TipoVentaCase, ventaId: number): string {
    const prefijos = {
      'preventa_sin_adelanto': '🕐 Orden',
      'preventa_con_adelanto': '💰 Orden',
      'marco_sin_adelanto': '🕐 Orden',
      'marco_con_adelanto': '💰 Orden',
      'venta_completada': '✅ Venta',
      'desconocido': '❓ Venta'
    };
    
    const prefijo = prefijos[tipoVenta as keyof typeof prefijos] || '📋 Venta';
    return `${prefijo} #${ventaId}`;
  }

  /**
   * Construye la descripción con información del caso específico
   */
  private buildDescriptionWithCase(
    tipoVenta: TipoVentaCase, 
    categoria: string, 
    total: number, 
    saldoPagado: number, 
    saldoFaltante: number, 
    fecha: string
  ): string {
    let descripcionTipo = '';
    
    switch (tipoVenta) {
      case 'preventa_sin_adelanto':
      case 'marco_sin_adelanto':
        descripcionTipo = 'Sin adelanto - Cliente pagará al recoger';
        break;
      case 'preventa_con_adelanto':
      case 'marco_con_adelanto':
        descripcionTipo = `Adelanto: Bs ${saldoPagado.toFixed(2)} - Falta: Bs ${saldoFaltante.toFixed(2)}`;
        break;
      default:
        descripcionTipo = `Total: Bs ${total.toFixed(2)}`;
    }
    
    return `${descripcionTipo} • ${fecha}`;
  }

  /**
   * Obtiene el estado basado en el caso de venta
   */
  private getStatusByCase(tipoVenta: TipoVentaCase, saldoFaltante: number): PendingStatus {
    if (tipoVenta === 'venta_completada') {
      return 'completed';
    }
    
    if (saldoFaltante === 0) {
      return 'completed';
    }
    
    if (tipoVenta === 'preventa_sin_adelanto' || tipoVenta === 'marco_sin_adelanto') {
      return 'pending';
    }
    
    if (tipoVenta === 'preventa_con_adelanto' || tipoVenta === 'marco_con_adelanto') {
      return 'in_progress';
    }
    
    return 'pending';
  }

  /**
   * Obtiene la prioridad basada en el caso de venta y tiempo transcurrido
   */
  private getPriorityByCase(venta: Venta, tipoVenta: TipoVentaCase): PendingPriority {
    const fechaCreacion = new Date(venta.fecha || venta.created_at || Date.now());
    const diasPendientes = Math.floor((Date.now() - fechaCreacion.getTime()) / (1000 * 60 * 60 * 24));
    
    // Prioridad especial por tipo
    if (tipoVenta === 'marco_con_adelanto' || tipoVenta === 'preventa_con_adelanto') {
      // Con adelanto = mayor prioridad
      if (diasPendientes > 5) return 'urgent';
      if (diasPendientes > 2) return 'high';
      return 'medium';
    }
    
    if (tipoVenta === 'marco_sin_adelanto' || tipoVenta === 'preventa_sin_adelanto') {
      // Sin adelanto = menor urgencia inicial
      if (diasPendientes > 10) return 'urgent';
      if (diasPendientes > 7) return 'high';
      if (diasPendientes > 3) return 'medium';
      return 'low';
    }
    
    // Fallback a lógica original
    return this.getVentaPriority(venta);
  }

  private getVentaPriority(venta: Venta): 'low' | 'medium' | 'high' | 'urgent' {
    const fechaCreacion = new Date(venta.fecha || venta.created_at || Date.now());
    const diasPendientes = Math.floor((Date.now() - fechaCreacion.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diasPendientes > 7) return 'urgent';
    if (diasPendientes > 3) return 'high';
    if (diasPendientes > 1) return 'medium';
    return 'low';
  }

  private formatVentaDate(venta: Venta): string {
    const fecha = venta.fecha || venta.created_at;
    
    if (!fecha) {
      return new Date().toLocaleDateString('es-ES');
    }
    
    try {
      const fechaObj = new Date(fecha);
      
      if (isNaN(fechaObj.getTime())) {
        return `Fecha inválida`;
      }
      
      return fechaObj.toLocaleDateString('es-ES');
    } catch (error) {
      return `Error en fecha`;
    }
  }

    /**
   * Construye la descripción basada en la categoría
   */
  private buildDescription(categoria: string, tieneProductos: boolean, tieneMarcos: boolean, total: number, fecha: string): string {
    let descripcion = '';
    
    if (categoria === 'mixto') {
      descripcion = 'Productos + Marcos';
    } else if (categoria === 'productos') {
      descripcion = 'Productos';
    } else {
      descripcion = 'Marcos personalizados';
    }
    
    return `${descripcion} • Total: Bs ${total.toFixed(2)} • ${fecha}`;
  }

  applyFilters() {
    let filtered = [...this.pendingItems()];

    // FILTRO DE SEGURIDAD: Excluir ventas completadas que podrían haber pasado
    filtered = filtered.filter(item => 
      item.tipoVenta !== 'venta_completada' && 
      item.status !== 'completed'
    );

    // Apply search filter
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(term) ||
        item.subtitle?.toLowerCase().includes(term) ||
        item.description?.toLowerCase().includes(term) ||
        item.clientName?.toLowerCase().includes(term)
      );
    }

    // Apply priority filter
    if (this.selectedPriority !== 'all') {
      filtered = filtered.filter(item => item.priority === this.selectedPriority);
    }

    this.filteredItems = filtered;
    this.updatePagination();
  }

  updatePagination() {
    if (this.config.enablePagination) {
      this.totalPages = Math.ceil(this.filteredItems.length / this.config.itemsPerPage);
      this.currentPage = Math.min(this.currentPage, this.totalPages || 1);
    }
  }

  get paginatedItems(): PendingItem[] {
    if (!this.config.enablePagination) {
      return this.filteredItems;
    }
    
    const start = (this.currentPage - 1) * this.config.itemsPerPage;
    const end = start + this.config.itemsPerPage;
    return this.filteredItems.slice(start, end);
  }

  onItemClick(item: PendingItem) {
    this.itemClick.emit(item);
  }

  onActionClick(action: string, item: PendingItem, event: Event) {
    event.stopPropagation();
    
    console.log('🎯 [PendingList] Acción solicitada:', { action, itemId: item.id, itemTitle: item.title });
    
    // Si es una acción de completar preventa, mostrar modal de forma de pago
    if (action === 'complete' && item.type === 'preventa') {
      this.showPaymentSelectionModal(item);
    } else {
      // Para otras acciones, emitir directamente
      this.actionClick.emit({ action, item });
      
      // Programar actualización después de un pequeño delay para permitir que la acción se complete
      setTimeout(() => {
        console.log('🔄 [PendingList] Actualizando lista después de acción:', action);
        this.forceRefresh();
      }, 500);
    }
  }

  // Métodos para el modal de selección de forma de pago
  showPaymentSelectionModal(item: PendingItem) {
    this.selectedItemForPayment = item;
    this.selectedFormaPagoId = null;
    this.showPaymentModal = true;
  }

  closePaymentModal() {
    this.showPaymentModal = false;
    this.selectedItemForPayment = null;
    this.selectedFormaPagoId = null;
  }

  confirmPaymentAndComplete() {
    if (this.selectedItemForPayment && this.selectedFormaPagoId) {
      console.log('💰 [PendingList] Completando pago con forma de pago ID:', this.selectedFormaPagoId);
      
      this.actionClick.emit({ 
        action: 'complete', 
        item: this.selectedItemForPayment,
        formaPagoId: this.selectedFormaPagoId
      });
      
      this.closePaymentModal();
      
      // Programar actualización después de completar el pago
      setTimeout(() => {
        console.log('🔄 [PendingList] Actualizando lista después de completar pago');
        this.forceRefresh();
      }, 800); // Un poco más de tiempo para operaciones de pago
    }
  }

  get formasPagoActivas(): FormaPago[] {
    return this.formasPagoState().formasPago.filter(
      fp => fp.activo !== false && !fp.nombre.toLowerCase().includes('preventa')
    );
  }

  getFormaPagoNombre(formaPagoId: number): string {
    const formaPago = this.formasPagoState().formasPago.find(fp => fp.id === formaPagoId);
    return formaPago?.nombre || 'Forma de pago desconocida';
  }

  getCategoriaLabel(categoria: 'productos' | 'marcos' | 'mixto'): string {
    const labels = {
      productos: 'Productos',
      marcos: 'Marcos',
      mixto: 'Mixto'
    };
    return labels[categoria] || categoria;
  }

  getCategoriaIcon(categoria: 'productos' | 'marcos' | 'mixto'): string {
    const icons = {
      productos: 'fas fa-box',
      marcos: 'fas fa-picture-o',
      mixto: 'fas fa-layer-group'
    };
    return icons[categoria] || 'fas fa-circle';
  }

  getCategoriaClass(categoria: 'productos' | 'marcos' | 'mixto'): string {
    const classes = {
      productos: 'bg-blue-100 text-blue-800',
      marcos: 'bg-purple-100 text-purple-800',
      mixto: 'bg-green-100 text-green-800'
    };
    return classes[categoria] || 'bg-gray-100 text-gray-800';
  }

  /**
   * Obtiene la etiqueta del tipo de venta
   */
  getTipoVentaLabel(tipoVenta?: TipoVentaCase): string {
    const labels: Record<TipoVentaCase, string> = {
      'preventa_sin_adelanto': 'Sin Adelanto',
      'preventa_con_adelanto': 'Con Adelanto',
      'marco_sin_adelanto': 'Marco - Sin Adelanto',
      'marco_con_adelanto': 'Marco - Con Adelanto', 
      'venta_completada': 'Completada',
      'desconocido': 'Desconocido'
    };
    return tipoVenta ? labels[tipoVenta] : 'N/A';
  }

  /**
   * Obtiene la clase CSS del tipo de venta
   */
  getTipoVentaClass(tipoVenta?: TipoVentaCase): string {
    const classes: Record<TipoVentaCase, string> = {
      'preventa_sin_adelanto': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'preventa_con_adelanto': 'bg-orange-100 text-orange-800 border-orange-300',
      'marco_sin_adelanto': 'bg-indigo-100 text-indigo-800 border-indigo-300',
      'marco_con_adelanto': 'bg-cyan-100 text-cyan-800 border-cyan-300',
      'venta_completada': 'bg-green-100 text-green-800 border-green-300',
      'desconocido': 'bg-gray-100 text-gray-800 border-gray-300'
    };
    return tipoVenta ? classes[tipoVenta] : 'bg-gray-100 text-gray-800';
  }

  /**
   * Obtiene el ícono del tipo de venta
   */
  getTipoVentaIcon(tipoVenta?: TipoVentaCase): string {
    const icons: Record<TipoVentaCase, string> = {
      'preventa_sin_adelanto': 'fas fa-clock',
      'preventa_con_adelanto': 'fas fa-coins',
      'marco_sin_adelanto': 'fas fa-frame',
      'marco_con_adelanto': 'fas fa-palette',
      'venta_completada': 'fas fa-check-circle',
      'desconocido': 'fas fa-question-circle'
    };
    return tipoVenta ? icons[tipoVenta] : 'fas fa-circle';
  }

  getTypeLabel(type: PendingType): string {
    const labels: Record<PendingType, string> = {
      preventa: 'Preventa',
      order: 'Pedido',
      payment: 'Pago',
      delivery: 'Entrega',
      stock: 'Stock',
      maintenance: 'Mantenimiento',
      customer_request: 'Solicitud Cliente',
      other: 'Otro'
    };
    return labels[type] || type;
  }

  getStatusLabel(status: PendingStatus): string {
    const labels: Record<PendingStatus, string> = {
      pending: 'Pendiente',
      in_progress: 'En Proceso',
      completed: 'Completado',
      cancelled: 'Cancelado',
      overdue: 'Vencido'
    };
    return labels[status] || status;
  }

  getPriorityLabel(priority: PendingPriority): string {
    const labels: Record<PendingPriority, string> = {
      low: 'Baja',
      medium: 'Media',
      high: 'Alta',
      urgent: 'Urgente'
    };
    return labels[priority] || priority;
  }

  getStatusClass(status: PendingStatus): string {
    const classes: Record<PendingStatus, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-800',
      overdue: 'bg-red-100 text-red-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }

  getPriorityClass(priority: PendingPriority): string {
    const classes: Record<PendingPriority, string> = {
      low: 'border-l-green-400',
      medium: 'border-l-yellow-400',
      high: 'border-l-orange-400',
      urgent: 'border-l-red-400'
    };
    return classes[priority] || 'border-l-gray-400';
  }

  getTypeIcon(type: PendingType): string {
    const icons: Record<PendingType, string> = {
      preventa: 'fas fa-clock',
      order: 'fas fa-shopping-cart',
      payment: 'fas fa-credit-card',
      delivery: 'fas fa-truck',
      stock: 'fas fa-boxes',
      maintenance: 'fas fa-tools',
      customer_request: 'fas fa-user-circle',
      other: 'fas fa-exclamation-circle'
    };
    return icons[type] || 'fas fa-circle';
  }

  resetFilters() {
    this.searchTerm = '';
    this.selectedPriority = 'all';
    this.currentPage = 1;
    this.applyFilters();
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  /** Devuelve hasta 5 páginas visibles centradas en la página actual */
  get visiblePages(): number[] {
    const maxVisible = 5;
    const half = Math.floor(maxVisible / 2);
    let start = Math.max(1, this.currentPage - half);
    let end = start + maxVisible - 1;
    if (end > this.totalPages) {
      end = this.totalPages;
      start = Math.max(1, end - maxVisible + 1);
    }
    const pages: number[] = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  formatDate(dateString: string): string {
    return dateString;
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'BOB',
      minimumFractionDigits: 0
    }).format(amount).replace('BOB', 'Bs');
  }
}
