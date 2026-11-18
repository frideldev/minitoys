import { Injectable, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ItemVenta } from '../interfaces/item-venta.interface';
import { TodosInventario } from '../../inventario/interfaces/inventario.interface';
import { AuthStateService } from '../../../../auth/services/auth-state.service';

@Injectable({
  providedIn: 'root'
})
export class VentaFormService {
  private fb = new FormBuilder();
  private authState = inject(AuthStateService);

  createVentaForm(): FormGroup {
    const currentUser = this.authState.getCurrentUser();
    const usuarioId = currentUser?.id || 1; // Fallback to 1 if no user

    return this.fb.group({
      cliente_id: ['', Validators.required],
      producto_id: [''],
      cantidad: [''],
      descuento: [0],
      adelanto: [0],
      metodo_pago: ['api_payment'], // Valor fijo para compatibilidad
      forma_pago_id: ['', Validators.required],
      sucursal_id: [currentUser?.id_sucursal || 2, Validators.required], // Use user's sucursal
      usuario_id: [usuarioId, Validators.required] // Use actual user ID
    });
  }

  // Métodos para manejo de items del carrito
  static getItemsFromStorage(): ItemVenta[] {
    const itemsGuardados = localStorage.getItem('ventaItems');
    return itemsGuardados ? JSON.parse(itemsGuardados) : [];
  }

  static saveItemsToStorage(items: ItemVenta[]): void {
    localStorage.setItem('ventaItems', JSON.stringify(items));
  }

  static clearItemsFromStorage(): void {
    localStorage.removeItem('ventaItems');
  }

  // Cálculos
  static calcularSubtotal(items: ItemVenta[]): number {
    return items.reduce((acc, item) => acc + item.subtotal, 0);
  }

  static calcularTotal(subtotal: number, descuento: number): number {
    return subtotal - descuento;
  }

  // Validaciones de stock
  static getStockDisponible(productId: number, inventarioItems: TodosInventario[]): number {
    const producto = inventarioItems.find(p => p.id === productId);
    return producto ? producto.stock_global_actual : 0;
  }

  static getStockRestante(productId: number, items: ItemVenta[], inventarioItems: TodosInventario[]): number {
    const stockTotal = this.getStockDisponible(productId, inventarioItems);
    const item = items.find(i => i.id === productId);
    const cantidadEnVenta = item ? item.cantidad : 0;
    return stockTotal - cantidadEnVenta;
  }

  static getProductosDisponibles(inventarioItems: TodosInventario[], items: ItemVenta[]): TodosInventario[] {
    if (inventarioItems.length === 0) {
      return [];
    }
    
    return inventarioItems.filter(producto => {
      const stockReal = this.getStockRestante(producto.id, items, inventarioItems);
      return stockReal > 0;
    });
  }

  // Validación para agregar item
  static puedeAgregarItem(
    selectedProduct: TodosInventario | null, 
    cantidad: number, 
    items: ItemVenta[], 
    inventarioItems: TodosInventario[]
  ): boolean {
    if (!selectedProduct || cantidad <= 0) {
      return false;
    }
    
    const stockDisponible = this.getStockRestante(selectedProduct.id, items, inventarioItems);
    return cantidad <= stockDisponible;
  }

  // Validación para completar venta
  static puedeCompletarVenta(clienteId: string | null, metodoPago: string | null, formaPagoId: string | null, items: ItemVenta[], isProcessing: boolean, usuarioId?: number | null, sucursalId?: number | null): boolean {
    // Verificar campos requeridos para completar la venta
    const tieneCliente = !!(clienteId && clienteId.trim() !== '');
    const tieneFormaPago = !!(formaPagoId && formaPagoId.trim() !== '');
    const tieneItems = items.length > 0;
    const tieneUsuario = !!(usuarioId && usuarioId > 0);
    const tieneSucursal = !!(sucursalId && sucursalId > 0);
    
    return tieneCliente && tieneFormaPago && tieneItems && tieneUsuario && tieneSucursal && !isProcessing;
  }

  // Crear item de venta
  static crearItemVenta(producto: TodosInventario, cantidad: number): ItemVenta {
    return {
      id: producto.id,
      descripcion: producto.descripcion,
      cantidad: cantidad,
      precioUnitario: producto.precioVenta,
      subtotal: cantidad * producto.precioVenta
    };
  }

  // Limpiar validaciones de cantidad
  static limpiarValidacionesCantidad(form: FormGroup): void {
    const cantidadControl = form.get('cantidad');
    cantidadControl?.clearValidators();
    cantidadControl?.updateValueAndValidity();
  }

  // Agregar validaciones de cantidad
  static agregarValidacionesCantidad(form: FormGroup): void {
    const cantidadControl = form.get('cantidad');
    cantidadControl?.setValidators([Validators.required, Validators.min(1)]);
    cantidadControl?.updateValueAndValidity();
  }
}
