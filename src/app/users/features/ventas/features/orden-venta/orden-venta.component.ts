import { Component, EventEmitter, Input, OnInit, Output, ViewChild, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TopbarComponent } from '../../../../../shared/ui/layout/topbar/topbar.component';
import { LayoutComponent } from '../../../../../shared/ui/layout/layout.component';
import { VisorReciboComponent } from '../../../../../shared/components/visor-recibo/visor-recibo.component';
import { PendingListComponent } from '../../../../../shared/ui/pending-list';
import { PendingConfig, PendingItem } from '../../../../../shared/ui/pending-list/interfaces/pending-item.interface';
import { ClienteSelectorComponent } from '../../../../../shared/components/cliente-selector';
import { NgSelectModule } from '@ng-select/ng-select';
import { OrdenVentaStateService } from '../../services/orden-venta-state.service';
import { AuthStateService } from '../../../../../auth/services/auth-state.service';
import { FormasPagoStateService } from '../../../../services/formaspago-state.service';
import { VentasStateService } from '../../services/ventas-state.service';
import { VentasUIService } from '../../services/ventas-ui.service';
import { Cliente } from '../../../../interfaces/cliente.interface';
import { VentaProductoMarcoRequest } from '../../interfaces/venta.interface';
import { PriceUtils } from '../../../../../shared/utils/price.utils';
import { ItemVenta } from '../../interfaces/item-venta.interface';

@Component({
  selector: 'app-orden-venta',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TopbarComponent,
    LayoutComponent,
    VisorReciboComponent,
    ClienteSelectorComponent,
    NgSelectModule,
    PendingListComponent,
  ],
  templateUrl: './orden-venta.component.html',
  styleUrl: './orden-venta.component.css'
})
export class OrdenVentaComponent implements OnInit {
  @Input() embedded = false;
  @Output() orderCompleted = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private authState = inject(AuthStateService);
  private formasPagoStateService = inject(FormasPagoStateService);
  private ventasStateService = inject(VentasStateService);
  private ventasUIService = inject(VentasUIService);
  readonly ordenState = inject(OrdenVentaStateService);

  protected formasPagoState = this.formasPagoStateService.state;

  ordenForm: FormGroup = this.fb.group({
    cliente_id: ['', Validators.required],
    forma_pago_id: ['', Validators.required],
    descuento: [0, [Validators.min(0)]],
    adelanto: [0, [Validators.min(0)]],
    fecha_entrega: [''],
  });

  @ViewChild('clienteSelector') clienteSelector?: ClienteSelectorComponent;
  selectedCliente: Cliente | null = null;
  isProcessing = false;

  pendingConfig: PendingConfig = {
    title: 'Órdenes Pendientes',
    showFilters: true,
    showSearch: true,
    allowActions: true,
    itemsPerPage: 8,
    enablePagination: true,
  };

  // Visor de recibo
  mostrarVisorRecibo = false;
  ventaIdParaRecibo: number | null = null;

  readonly descuento = computed(() => Number(this.ordenForm.get('descuento')?.value) || 0);
  readonly total = computed(() =>
    Math.max(0, Number((this.ordenState.totalOrden() - this.descuento()).toFixed(2)))
  );

  get selectedFormaPago() {
    const id = Number(this.ordenForm.get('forma_pago_id')?.value);
    if (!id) return null;
    return this.formasPagoState().formasPago.find(fp => fp.id === id) || null;
  }

  get esPreventaFormaPago(): boolean {
    const nombre = this.selectedFormaPago?.nombre || '';
    return nombre.toLowerCase().replace(/[\s\-_]+/g, '').includes('preventa');
  }

  get puedeCompletarOrden(): boolean {
    if (this.isProcessing) return false;
    if (!this.ordenForm.get('cliente_id')?.value) return false;
    if (!this.ordenForm.get('forma_pago_id')?.value) return false;
    if (!this.ordenState.tieneItems()) return false;
    const user = this.authState.getCurrentUser();
    if (!user) return false;
    return true;
  }

  get formasPagoFiltradas() {
    const adelanto = Number(this.ordenForm.get('adelanto')?.value) || 0;
    const activas = this.formasPagoState().formasPago.filter(fp => fp.activo);
    if (adelanto > 0) {
      return activas.filter(fp =>
        (fp.nombre || '').toLowerCase().replace(/[\s\-_]+/g, '').includes('preventa')
      );
    }
    return activas;
  }

  ngOnInit(): void {
    if (!this.embedded) {
      this.formasPagoStateService.refreshData();
    }
    // Pre-fill client if already set in order state
    const cliente = this.ordenState.cliente();
    if (cliente) {
      this.selectedCliente = cliente;
      this.ordenForm.patchValue({ cliente_id: String(cliente.id) });
    }
  }

  onClienteSeleccionado(cliente: Cliente | null): void {
    this.selectedCliente = cliente;
    if (cliente) {
      this.ordenState.setCliente(cliente);
      this.ordenForm.patchValue({ cliente_id: String(cliente.id) });
    } else {
      this.ordenForm.patchValue({ cliente_id: '' });
    }
  }

  onNuevoClienteCreado(cliente: Cliente): void {
    this.onClienteSeleccionado(cliente);
  }

  eliminarProducto(item: ItemVenta): void {
    this.ordenState.removeProducto(item.id);
  }

  limpiarOrden(): void {
    this.ordenState.clear();
    this.ordenForm.reset({ descuento: 0, adelanto: 0 });
    this.selectedCliente = null;
    this.restaurarClienteGenerico();
  }

  private restaurarClienteGenerico(): void {
    this.clienteSelector?.writeValue(null);
    this.clienteSelector?.seleccionarGenerico();
  }

  async registrarOrden(): Promise<void> {
    if (!this.authState.validateUserAndRedirect()) return;
    if (!this.puedeCompletarOrden) return;

    const currentUser = this.authState.getCurrentUser();
    if (!currentUser) { alert('Error: Usuario no autenticado'); return; }

    const clienteId = Number(this.ordenForm.get('cliente_id')?.value);
    const formaPagoId = Number(this.ordenForm.get('forma_pago_id')?.value);
    const descuentoBs = Number(this.ordenForm.get('descuento')?.value) || 0;
    const adelantoBs = Number(this.ordenForm.get('adelanto')?.value) || 0;
    const fechaEntrega = this.ordenForm.get('fecha_entrega')?.value || undefined;
    const totalBs = this.total();

    const totalCentavos = PriceUtils.toApi(totalBs);
    const adelantoCentavos = PriceUtils.toApi(adelantoBs);
    const descuentoCentavos = descuentoBs > 0 ? PriceUtils.toApi(descuentoBs) : undefined;

    const entregado = !this.esPreventaFormaPago;
    const pago = entregado ? 0 : adelantoCentavos;
    const saldo = adelantoCentavos;

    const detalles = this.ordenState.productos().map(p => ({
      idProducto: p.id,
      cantidad: p.cantidad
    }));

    const ventaRequest: VentaProductoMarcoRequest = {
      pago,
      entregado,
      adelanto: adelantoCentavos > 0 ? adelantoCentavos : undefined,
      saldo,
      idCliente: clienteId,
      idSucursal: currentUser.id_sucursal,
      idFormaPago: formaPagoId,
      idUsuario: currentUser.id,
      fechaEntrega,
      descuento: descuentoCentavos,
      detalles,
    };

    this.isProcessing = true;

    const preventaAnterior = this.ventasStateService.state().currentPreventa;
    const errorAnterior = this.ventasStateService.state().error;
    this.ventasStateService.createPreventa(ventaRequest);

    const result = await new Promise<{ success: boolean; preventaId?: number; error?: string }>(
      (resolve) => {
        let attempts = 0;
        const maxAttempts = 14;
        const poll = () => {
          attempts++;
          const state = this.ventasStateService.state();
          if (state.currentPreventa && state.currentPreventa !== preventaAnterior) {
            const ventaData = (state.currentPreventa as any)?.venta || state.currentPreventa;
            resolve({ success: true, preventaId: ventaData?.id });
          } else if (state.error && state.error !== errorAnterior) {
            resolve({ success: false, error: state.error });
          } else if (attempts >= maxAttempts) {
            resolve({ success: false, error: 'Sin respuesta del servidor. Verifique en la lista de pendientes.' });
          } else {
            setTimeout(poll, 350);
          }
        };
        setTimeout(poll, 500);
      }
    );

    this.isProcessing = false;

    if (result.success) {
      alert(entregado
        ? '✅ Venta completada y registrada exitosamente.'
        : adelantoBs > 0
          ? `💰 Preventa registrada con adelanto de Bs ${adelantoBs}.`
          : '📝 Preventa registrada. El cliente pagará al recoger.'
      );
      this.ventasStateService.refreshData();
      this.ordenState.clear();
      this.orderCompleted.emit();
      this.ordenForm.reset({ descuento: 0, adelanto: 0 });
      this.selectedCliente = null;
      this.restaurarClienteGenerico();
      if (result.preventaId) {
        setTimeout(() => {
          this.ventaIdParaRecibo = result.preventaId!;
          this.mostrarVisorRecibo = true;
        }, 800);
      }
    } else {
      alert(`❌ Error al registrar la orden: ${result.error}`);
    }
  }

  mostrarReciboPostVenta(ventaId: number): void {
    this.ventaIdParaRecibo = ventaId;
    this.mostrarVisorRecibo = true;
  }

  cerrarVisorRecibo(): void {
    this.mostrarVisorRecibo = false;
    this.ventaIdParaRecibo = null;
  }

  onPendingItemClick(item: PendingItem): void {
    if (!this.authState.validateUserAndRedirect()) return;
    // Solo mostramos el recibo al hacer clic en un item pendiente
    if (item.metadata?.preventaId) {
      this.mostrarReciboPostVenta(item.metadata.preventaId);
    }
  }

  async onPendingActionClick(event: { action: string; item: PendingItem; formaPagoId?: number }): Promise<void> {
    if (!this.authState.validateUserAndRedirect()) return;
    await this.ventasUIService.handlePendingActionClick(
      event, [],
      () => this.ventasStateService.refreshData(),
      (ventaId) => this.mostrarReciboPostVenta(ventaId)
    );
  }
}
