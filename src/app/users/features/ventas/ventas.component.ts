import { Component, OnInit, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormsModule } from '@angular/forms';
import { TopbarComponent } from "../../../shared/ui/layout/topbar/topbar.component";
import { LayoutComponent } from "../../../shared/ui/layout/layout.component";
import { OrdenVentaComponent } from './features/orden-venta/orden-venta.component';
import { OrdenVentaStateService } from './services/orden-venta-state.service';
import { ClientesStateService } from '../../services/clientes-state.service';
import { FormasPagoStateService } from '../../services/formaspago-state.service';
import { Cliente } from '../../interfaces/cliente.interface';
import { InventarioStateService } from '../inventario/services/inventario-state.service';
import { TodosInventario } from '../inventario/interfaces/inventario.interface';
import { NgSelectModule } from '@ng-select/ng-select';
import { VentasStateService } from './services/ventas-state.service';
import { ItemVenta, NuevoCliente } from './interfaces/item-venta.interface';
import { VentaFormService } from './services/venta-form.service';
import { VentaOperationsService } from './services/venta-operations.service';
import { ClienteOperationsService } from './services/cliente-operations.service';
import { VentasUIService } from './services/ventas-ui.service';
import { VentasFormHandlerService } from './services/ventas-form-handler.service';
import { VentasStateManagerService } from './services/ventas-state-manager.service';
import { VentasComponentOperationsService } from './services/ventas-component-operations.service';
import { VisorReciboComponent } from '../../../shared/components/visor-recibo/visor-recibo.component';
import { AuthStateService } from '../../../auth/services/auth-state.service';
import { PendingListComponent } from '../../../shared/ui/pending-list/pending-list.component';



@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TopbarComponent, 
    LayoutComponent,
    NgSelectModule,
    VisorReciboComponent,
    OrdenVentaComponent,
    PendingListComponent,
  ],
  templateUrl: './ventas.component.html',
  styleUrl: './ventas.component.css'
})
export class VentasComponent implements OnInit {
  private authStateService = inject(AuthStateService);
  private clientesState = inject(ClientesStateService);
  private formasPagoStateService = inject(FormasPagoStateService);
  private inventarioStateService = inject(InventarioStateService);
  private ventasStateService = inject(VentasStateService);
  private ventaFormService = inject(VentaFormService);
  private ventaOperationsService = inject(VentaOperationsService);
  private clienteOperationsService = inject(ClienteOperationsService);
  private ventasUIService = inject(VentasUIService);
  private ventasFormHandlerService = inject(VentasFormHandlerService);
  private ventasStateManager = inject(VentasStateManagerService);
  private ventasComponentOperations = inject(VentasComponentOperationsService);
  private ordenVentaState = inject(OrdenVentaStateService);

  protected clienteState = this.clientesState.state;
  protected formasPagoState = this.formasPagoStateService.state;
  protected inventarioState = this.inventarioStateService.state;
  protected ventasState = this.ventasStateService.state;
  selectedCliente: Cliente | null = null;
  selectedProduct: TodosInventario | null = null;
  selectedProductForSelect: TodosInventario | null = null;
  selectedProductText: string = '';
  showDropdown: boolean = false;
  showAllProducts: boolean = false;
  filteredProducts: TodosInventario[] = [];
  searchMode: 'nombre' | 'codigo' = 'nombre';
  codigoText = '';
  codigoError: string | null = null;

  // Effect para observar cambios en el estado de ventas
  private ventasEffect = effect(() => {
    const ventasState = this.ventasState();
    if (ventasState.currentPreventa) {
      const ventaData = (ventasState.currentPreventa as any)?.venta || ventasState.currentPreventa;
      // Solo mostrar el indicador de preventa activa si es realmente una preventa
      // (entregado === false). Las ventas directas (efectivo/QR, entregado === true)
      // no deben activar el banner, ya que son compras completadas al instante.
      if (ventaData?.entregado === false) {
        this.currentPreventaId = ventaData?.id || null;
      } else {
        // Venta directa completada: limpiar el indicador para no bloquear la siguiente venta
        this.currentPreventaId = null;
      }
    }
  });

  // Properties
  mostrarNuevoCliente = false;
  nuevoCliente: NuevoCliente = { nombre: '', apellido: '', celular: '' };
  ventaForm: FormGroup = this.ventaFormService.createVentaForm();
  items: ItemVenta[] = [];
  subtotal = 0;
  descuento = 0;
  total = 0;
  currentPreventaId: number | null = null;
  isProcessing = false;
  
  // Estado para visor de recibo  
  mostrarVisorRecibo = false;
  ventaIdParaRecibo: number | null = null;

  // Helper: returns all inventory items for the current filter (uses allFilteredItems when available to avoid pagination cuts)
  private get todosInventarioItems(): TodosInventario[] {
    const state = this.inventarioState();
    return (state.allFilteredItems && state.allFilteredItems.length > 0)
      ? state.allFilteredItems
      : (state.items || []);
  }

  // Getters
  get productosDisponibles() { 
    return this.ventasStateManager.getProductosDisponibles(this.todosInventarioItems, this.items); 
  }
  get puedeAgregarItem() { 
    const cantidad = Number(this.ventaForm.get('cantidad')?.value);
    const tieneProductoValido = this.selectedProduct !== null && this.selectedProductText.trim() !== '';
    const productoCoincide = this.selectedProduct && this.selectedProductText === this.selectedProduct.descripcion;
    
    return tieneProductoValido && 
           productoCoincide && 
           this.ventasStateManager.puedeAgregarItem(this.selectedProduct, cantidad, this.items, this.todosInventarioItems); 
  }
  get puedeCompletarVenta() { 
    const clienteId = this.ventaForm.get('cliente_id')?.value;
    const formaPagoId = this.ventaForm.get('forma_pago_id')?.value;
    const metodoPago = this.ventaForm.get('metodo_pago')?.value;
    const usuarioId = this.ventaForm.get('usuario_id')?.value;
    const sucursalId = this.ventaForm.get('sucursal_id')?.value;
    
    return this.ventasStateManager.puedeCompletarVenta(
      clienteId, 
      metodoPago, 
      formaPagoId,
      this.items, 
      this.isProcessing,
      usuarioId,
      sucursalId
    ); 
  }

  get selectedFormaPago() {
    const formaPagoId = Number(this.ventaForm.get('forma_pago_id')?.value);
    if (!formaPagoId) return null;
    return this.formasPagoState().formasPago.find(fp => fp.id === formaPagoId) || null;
  }

  getSelectedFormaPago() {
    const formaPagoId = Number(this.ventaForm.get('forma_pago_id')?.value);
    if (!formaPagoId) return null;
    return this.formasPagoState().formasPago.find(fp => fp.id === formaPagoId) || null;
  }

  /**
   * Devuelve las formas de pago disponibles según el adelanto ingresado.
   * Si hay adelanto > 0, solo se muestran las opciones "preventa".
   * Si adelanto = 0, se muestran todas las activas.
   */
  get formasPagoFiltradas() {
    const adelanto = Number(this.ventaForm.get('adelanto')?.value) || 0;
    const activas = this.formasPagoState().formasPago.filter(fp => fp.activo);
    if (adelanto > 0) {
      return activas.filter(fp => fp.nombre.toLowerCase().includes('preventa'));
    }
    return activas;
  }

  // Utility methods
  getStockRealDisponible(productId: number) { 
    return this.ventasStateManager.getStockMethods().getStockRealDisponible(productId, this.items, this.todosInventarioItems); 
  }
  getProductoEnCarrito(productId: number) { 
    return this.ventasStateManager.getItemMethods().getProductoEnCarrito(productId, this.items); 
  }
  getCantidadEnCarrito(productId: number) { 
    return this.ventasStateManager.getItemMethods().getCantidadEnCarrito(productId, this.items); 
  }
  getStockDisponible(productId: number) { 
    return this.ventasStateManager.getStockMethods().getStockDisponible(productId, this.todosInventarioItems); 
  }
  getStockRestante(productId: number) { 
    return this.ventasStateManager.getStockMethods().getStockRestante(productId, this.items, this.todosInventarioItems); 
  }
  calcularTotales() {
    const descuentoValue = Number(this.ventaForm.get('descuento')?.value) || 0;
    const result = this.ventasStateManager.calcularTotales(this.items, descuentoValue);
    this.subtotal = result.subtotal;
    this.total = result.total;
    this.descuento = descuentoValue;
  }

  ngOnInit() {
    this.clientesState.refreshData();
    this.formasPagoStateService.refreshData();
    this.inventarioStateService.filterByTipo('producto');
    this.cargarItemsGuardados();
    this.ventasStateService.refreshData();
  }

  private cargarItemsGuardados() {
    this.items = VentaFormService.getItemsFromStorage();
    this.sincronizarProductosDeOrden();
    this.calcularTotales();
  }
  private guardarItems() { VentaFormService.saveItemsToStorage(this.items); }
  private sincronizarProductosDeOrden() {
    this.ordenVentaState.setProductos(this.items);
  }

  // Form handlers
  onClienteChange(cliente: Cliente | null) {
    const result = this.ventasFormHandlerService.handleClienteChange(
      cliente, this.ventaForm, this.items, () => this.calcularTotales(), () => this.cargarItemsGuardados());
    this.selectedCliente = result.selectedCliente;
    this.items = result.items;
  }

  onProductoChange(productoId: number | null) {
    const result = this.ventasFormHandlerService.handleProductoChange(productoId, this.ventaForm, this.todosInventarioItems);
    this.selectedProduct = result.selectedProduct;
    this.selectedProductForSelect = result.selectedProductForSelect;
  }

  onProductSearch(event: any) {
    const searchValue = event.target.value.toLowerCase();
    this.selectedProductText = event.target.value;
    
    if (searchValue.trim() === '') {
      this.filteredProducts = [];
      this.showDropdown = false;
      this.showAllProducts = false;
      // Limpiar la selección si se borra el texto
      this.selectedProduct = null;
      this.selectedProductForSelect = null;
    } else {
      this.filteredProducts = this.productosDisponibles.filter(producto =>
        producto.descripcion.toLowerCase().includes(searchValue) ||
        producto.codigo.toLowerCase().includes(searchValue) ||
        producto.precioVenta.toString().includes(searchValue)
      ).slice(0, 10); // Limitar a 10 resultados
      this.showDropdown = true;
      this.showAllProducts = false;
    }
  }

  setSearchMode(mode: 'nombre' | 'codigo') {
    if (this.searchMode === mode) return;
    this.searchMode = mode;
    this.codigoText = '';
    this.codigoError = null;
    this.selectedProductText = '';
    this.selectedProduct = null;
    this.selectedProductForSelect = null;
    this.filteredProducts = [];
    this.showDropdown = false;
    this.ventaForm.patchValue({ producto_id: null, cantidad: '' });
  }

  onCodigoInput() {
    this.codigoError = null;
    this.selectedProduct = null;
    this.selectedProductForSelect = null;
    this.selectedProductText = '';
    const term = this.codigoText.trim().toLowerCase();
    if (!term) {
      this.filteredProducts = [];
      this.showDropdown = false;
      return;
    }
    const coincidencias = this.productosDisponibles.filter(p => p.codigo?.toLowerCase().includes(term));
    // Los códigos que empiezan con lo escrito aparecen primero
    coincidencias.sort((a, b) =>
      Number(b.codigo.toLowerCase().startsWith(term)) - Number(a.codigo.toLowerCase().startsWith(term)));
    this.filteredProducts = coincidencias.slice(0, 10);
    this.showDropdown = true;
  }

  selectProductByCodigo(producto: TodosInventario) {
    this.selectProduct(producto);
    this.codigoText = producto.codigo;
    this.codigoError = null;
  }

  // Agrega 1 unidad del producto cuyo código coincide exactamente (compatible con lector de códigos)
  agregarPorCodigo() {
    const codigo = this.codigoText.trim().toLowerCase();
    if (!codigo) return;

    const producto = this.productosDisponibles.find(p => p.codigo?.trim().toLowerCase() === codigo);
    if (!producto) {
      this.showDropdown = false;
      const sinStock = this.todosInventarioItems.some(p => p.codigo?.trim().toLowerCase() === codigo);
      this.codigoError = sinStock
        ? 'El producto con ese código no tiene stock disponible.'
        : `No se encontró ningún producto con el código "${this.codigoText.trim()}".`;
      return;
    }

    this.selectProduct(producto);
    this.agregarItem();
    if (this.selectedProduct === null) {
      this.codigoText = '';
      this.codigoError = null;
      this.filteredProducts = [];
      this.showDropdown = false;
    }
  }

  onInputFocus() {
    if (this.selectedProductText.trim() === '') {
      this.displayAllProducts();
    } else {
      this.showDropdown = true;
    }
  }

  onInputClick() {
    if (this.selectedProductText.trim() === '') {
      this.displayAllProducts();
    }
  }

  private displayAllProducts() {
    this.filteredProducts = this.productosDisponibles.slice(0, 10); // Mostrar primeros 10 productos
    this.showDropdown = true;
    this.showAllProducts = true;
  }

  selectProduct(producto: TodosInventario) {
    this.selectedProductText = producto.descripcion;
    this.showDropdown = false;
    this.showAllProducts = false;
    this.onProductoChange(producto.id);
  }

  onInputBlur() {
    // Delay para permitir click en opciones
    setTimeout(() => {
      this.showDropdown = false;
      this.showAllProducts = false;
      
      // Validar si el texto ingresado corresponde a un producto válido
      if (this.selectedProductText.trim() !== '') {
        const productoEncontrado = this.productosDisponibles.find(producto =>
          producto.descripcion.toLowerCase() === this.selectedProductText.toLowerCase() ||
          producto.codigo.toLowerCase() === this.selectedProductText.toLowerCase()
        );
        
        if (!productoEncontrado) {
          // Si no se encuentra un producto válido, limpiar la selección
          this.selectedProductText = '';
          this.selectedProduct = null;
          this.selectedProductForSelect = null;
        } else if (this.selectedProduct?.id !== productoEncontrado.id) {
          // Si el texto corresponde a un producto diferente al seleccionado, actualizar
          this.selectProduct(productoEncontrado);
        }
      }
    }, 200);
  }

  onProductSelect(event: any) {
    // Método mantenido para compatibilidad
    const inputValue = event.target.value;
    const producto = this.productosDisponibles.find(p => 
      inputValue.includes(p.descripcion) && inputValue.includes(p.precioVenta.toString())
    );
    
    if (producto) {
      this.onProductoChange(producto.id);
    } else {
      this.onProductoChange(null);
    }
  }

  agregarItem() {
    if (!this.authStateService.validateUserAndRedirect()) {
      return;
    }
    
    const result = this.ventasFormHandlerService.handleAgregarItem(
      this.selectedProduct, this.ventaForm, this.items, this.todosInventarioItems,
      () => this.guardarItems(), () => this.calcularTotales());
    if (!result.success && result.error) { alert(result.error); return; }
    if (result.success) {
      this.items = result.items;
      this.sincronizarProductosDeOrden();
      this.selectedProduct = result.selectedProduct;
      this.selectedProductForSelect = result.selectedProductForSelect;
      this.selectedProductText = '';
      this.showDropdown = false;
      this.filteredProducts = [];
      this.calcularTotales(); // Recalcular totales después de actualizar items
    }
  }

  eliminarItem(index: number) {
    if (!this.authStateService.validateUserAndRedirect()) {
      return;
    }
    
    this.items = this.ventasFormHandlerService.handleEliminarItem(
      index, this.items, this.selectedProduct, this.ventaForm, this.todosInventarioItems,
      () => this.guardarItems(), () => this.calcularTotales());
    this.sincronizarProductosDeOrden();
    this.calcularTotales(); // Recalcular totales después de eliminar item
  }

  // Venta operations
  async createPreventa() {
    if (!this.authStateService.validateUserAndRedirect()) {
      return;
    }
    
    // Asegurar que los totales estén actualizados antes de crear la preventa
    this.calcularTotales();
    
    await this.ventasComponentOperations.createPreventa(
      this.ventaForm, this.items, this.total, this.isProcessing,
      (val) => this.isProcessing = val, () => this.limpiarFormulario(), () => this.ventasStateService.refreshData(),
      (ventaId) => this.mostrarReciboPostVenta(ventaId));
  }

  async completarVenta() {
    if (!this.authStateService.validateUserAndRedirect()) {
      return;
    }
    
    // Asegurar que los totales estén actualizados antes de completar la venta
    this.calcularTotales();
    
    await this.ventasComponentOperations.completarVenta(
      this.ventaForm, this.items, this.currentPreventaId, this.isProcessing,
      (val) => this.isProcessing = val, 
      () => this.limpiarFormulario(), 
      () => this.ventasStateService.refreshData(),
      (ventaId) => this.mostrarReciboPostVenta(ventaId)
    );
  }

  async cargarPreventa(preventaId: number) {
    if (!this.authStateService.validateUserAndRedirect()) {
      return;
    }
    
    await this.ventasComponentOperations.cargarPreventa(
      preventaId, this.ventaForm, (id) => this.currentPreventaId = id,
      (items) => this.items = items, () => this.calcularTotales());
  }

  async cancelarPreventa() {
    if (!this.authStateService.validateUserAndRedirect()) {
      return;
    }
    
    await this.ventasComponentOperations.cancelarPreventa(this.currentPreventaId, () => this.limpiarFormulario());
  }

  limpiarFormulario() {
    const result = this.ventasStateManager.limpiarFormularioCompleto(
      this.ventaForm, () => this.calcularTotales(), () => this.limpiarNuevoCliente());
    this.items = result.items; this.currentPreventaId = result.currentPreventaId;
    this.ordenVentaState.clear();
    this.isProcessing = result.isProcessing; this.selectedCliente = result.selectedCliente;
    this.selectedProduct = result.selectedProduct; this.selectedProductForSelect = result.selectedProductForSelect;
    this.selectedProductText = '';
    this.showDropdown = false;
    this.filteredProducts = [];
    this.mostrarNuevoCliente = result.mostrarNuevoCliente;
  }

  // Client operations
  toggleNuevoCliente() { 
    if (!this.authStateService.validateUserAndRedirect()) {
      return;
    }
    
    this.mostrarNuevoCliente = !this.mostrarNuevoCliente; 
    if (!this.mostrarNuevoCliente) this.limpiarNuevoCliente(); 
  }
  async guardarNuevoCliente() {
    if (!this.authStateService.validateUserAndRedirect()) {
      return;
    }
    
    const result = await this.clienteOperationsService.crearCliente(this.nuevoCliente);
    if (result.success) {
      this.limpiarNuevoCliente();
      this.mostrarNuevoCliente = false;
      alert('Cliente creado exitosamente');
    } else alert(`Error al crear cliente: ${result.error}`);
  }
  cancelarNuevoCliente() { this.limpiarNuevoCliente(); this.mostrarNuevoCliente = false; }
  private limpiarNuevoCliente() { this.nuevoCliente = this.clienteOperationsService.limpiarDatosNuevoCliente(); }

  // Métodos para visor de recibo
  verRecibo(ventaId: number) {
    this.ventaIdParaRecibo = ventaId;
    this.mostrarVisorRecibo = true;
  }

  cerrarVisorRecibo() {
    this.mostrarVisorRecibo = false;
    this.ventaIdParaRecibo = null;
  }

  mostrarReciboPostVenta(ventaId: number) {
    // Mostrar el recibo automáticamente después de completar la venta
    // Esto permite al cliente imprimir su recibo inmediatamente
    console.log('Mostrando recibo para venta ID:', ventaId);
    this.ventaIdParaRecibo = ventaId;
    this.mostrarVisorRecibo = true;
  }
}
