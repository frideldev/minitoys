import { Injectable, inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ItemVenta, NuevoCliente } from '../interfaces/item-venta.interface';
import { Cliente } from '../../../interfaces/cliente.interface';
import { TodosInventario } from '../../inventario/interfaces/inventario.interface';
import { VentaFormService } from './venta-form.service';
import { AuthStateService } from '../../../../auth/services/auth-state.service';

@Injectable({
  providedIn: 'root'
})
export class VentasStateManagerService {
  private authState = inject(AuthStateService);

  initializeComponent(): {
    items: ItemVenta[],
    subtotal: number,
    descuento: number,
    total: number,
    currentPreventaId: number | null,
    isProcessing: boolean,
    selectedCliente: Cliente | null,
    selectedProduct: TodosInventario | null,
    selectedProductForSelect: TodosInventario | null,
    mostrarNuevoCliente: boolean,
    nuevoCliente: NuevoCliente
  } {
    return {
      items: VentaFormService.getItemsFromStorage(),
      subtotal: 0,
      descuento: 0,
      total: 0,
      currentPreventaId: null,
      isProcessing: false,
      selectedCliente: null,
      selectedProduct: null,
      selectedProductForSelect: null,
      mostrarNuevoCliente: false,
      nuevoCliente: {
        nombre: '',
        apellido: '',
        celular: ''
      }
    };
  }

  limpiarFormularioCompleto(
    form: FormGroup,
    calcularTotalesCallback: () => void,
    limpiarNuevoClienteCallback: () => void
  ): {
    items: ItemVenta[],
    currentPreventaId: number | null,
    isProcessing: boolean,
    selectedCliente: Cliente | null,
    selectedProduct: TodosInventario | null,
    selectedProductForSelect: TodosInventario | null,
    mostrarNuevoCliente: boolean
  } {
    // Get current user data for reset
    const currentUser = this.authState.getCurrentUser();
    const usuarioId = currentUser?.id || 1;
    const sucursalId = currentUser?.id_sucursal || 2;
    
    // Limpiar localStorage usando el servicio
    VentaFormService.clearItemsFromStorage();
    
    // Resetear formulario completamente
    form.reset();
    
    // Establecer valores por defecto
    form.patchValue({
      cliente_id: '',
      producto_id: '',
      cantidad: '',
      descuento: 0,
      adelanto: 0,
      metodo_pago: 'api_payment', // Valor fijo para compatibilidad
      forma_pago_id: '',
      sucursal_id: sucursalId,
      usuario_id: usuarioId
    });
    
    // Limpiar validaciones del campo cantidad usando el servicio
    VentaFormService.limpiarValidacionesCantidad(form);
    
    // Recalcular totales (serán 0)
    calcularTotalesCallback();
    
    // Cerrar formulario de nuevo cliente si está abierto
    limpiarNuevoClienteCallback();
    
    return {
      items: [],
      currentPreventaId: null,
      isProcessing: false,
      selectedCliente: null,
      selectedProduct: null,
      selectedProductForSelect: null,
      mostrarNuevoCliente: false
    };
  }

  calcularTotales(items: ItemVenta[], descuento: number): { subtotal: number, total: number } {
    const subtotal = VentaFormService.calcularSubtotal(items);
    const total = VentaFormService.calcularTotal(subtotal, descuento);
    return { subtotal, total };
  }

  getProductosDisponibles(inventarioItems: TodosInventario[], items: ItemVenta[]): TodosInventario[] {
    return VentaFormService.getProductosDisponibles(inventarioItems, items);
  }

  puedeAgregarItem(
    selectedProduct: TodosInventario | null, 
    cantidad: number, 
    items: ItemVenta[], 
    inventarioItems: TodosInventario[]
  ): boolean {
    return VentaFormService.puedeAgregarItem(selectedProduct, cantidad, items, inventarioItems);
  }

  puedeCompletarVenta(clienteId: string | null, metodoPago: string | null, formaPagoId: string | null, items: ItemVenta[], isProcessing: boolean, usuarioId?: number | null, sucursalId?: number | null): boolean {
    return VentaFormService.puedeCompletarVenta(clienteId, metodoPago, formaPagoId, items, isProcessing, usuarioId, sucursalId);
  }

  getStockMethods() {
    return {
      getStockRealDisponible: (productId: number, items: ItemVenta[], inventarioItems: TodosInventario[]) => 
        VentaFormService.getStockRestante(productId, items, inventarioItems),
      getStockDisponible: (productId: number, inventarioItems: TodosInventario[]) => 
        VentaFormService.getStockDisponible(productId, inventarioItems),
      getStockRestante: (productId: number, items: ItemVenta[], inventarioItems: TodosInventario[]) => 
        VentaFormService.getStockRestante(productId, items, inventarioItems)
    };
  }

  getItemMethods() {
    return {
      getProductoEnCarrito: (productId: number, items: ItemVenta[]) => 
        items.find(item => item.id === productId),
      getCantidadEnCarrito: (productId: number, items: ItemVenta[]) => {
        const item = items.find(item => item.id === productId);
        return item ? item.cantidad : 0;
      }
    };
  }
}
