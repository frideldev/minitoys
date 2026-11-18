import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ItemVenta } from '../interfaces/item-venta.interface';
import { Cliente } from '../../../interfaces/cliente.interface';
import { TodosInventario } from '../../inventario/interfaces/inventario.interface';
import { VentaFormService } from './venta-form.service';

@Injectable({
  providedIn: 'root'
})
export class VentasFormHandlerService {

  handleClienteChange(
    cliente: Cliente | null, 
    form: FormGroup,
    items: ItemVenta[],
    calcularTotalesCallback: () => void,
    cargarItemsCallback: () => void
  ): { selectedCliente: Cliente | null, items: ItemVenta[] } {
    let updatedItems = items;
    
    if (cliente && cliente.id) {
      form.patchValue({
        cliente_id: cliente.id.toString()
      });
      cargarItemsCallback();
      return { selectedCliente: cliente, items: updatedItems };
    } else {
      form.patchValue({
        cliente_id: ''
      });
      updatedItems = [];
      calcularTotalesCallback();
      return { selectedCliente: null, items: updatedItems };
    }
  }

  handleProductoChange(
    productoId: number | null,
    form: FormGroup,
    inventarioItems: TodosInventario[]
  ): { selectedProduct: TodosInventario | null, selectedProductForSelect: TodosInventario | null } {
    if (productoId) {
      const producto = inventarioItems?.find(p => p.id === productoId);
      if (producto) {
        form.patchValue({
          producto_id: productoId.toString(),
          cantidad: '1'
        });
        
        VentaFormService.agregarValidacionesCantidad(form);
        return { selectedProduct: producto, selectedProductForSelect: producto };
      }
    } else {
      form.patchValue({
        producto_id: null,
        cantidad: ''
      });
      
      VentaFormService.limpiarValidacionesCantidad(form);
    }
    
    return { selectedProduct: null, selectedProductForSelect: null };
  }

  handleAgregarItem(
    selectedProduct: TodosInventario | null,
    form: FormGroup,
    items: ItemVenta[],
    inventarioItems: TodosInventario[],
    guardarItemsCallback: () => void,
    calcularTotalesCallback: () => void
  ): { 
    success: boolean, 
    items: ItemVenta[], 
    selectedProduct: TodosInventario | null, 
    selectedProductForSelect: TodosInventario | null,
    error?: string 
  } {
    const cantidadValue = form.get('cantidad')?.value;
    
    if (!selectedProduct || !cantidadValue) {
      return { success: false, items, selectedProduct, selectedProductForSelect: null };
    }
    
    const cantidad = Number(cantidadValue);
    
    if (cantidad <= 0) {
      return { success: false, items, selectedProduct, selectedProductForSelect: null, error: 'La cantidad debe ser mayor a 0' };
    }
    
    const stockRealDisponible = VentaFormService.getStockRestante(
      selectedProduct.id, 
      items, 
      inventarioItems
    );
      
    if (cantidad > stockRealDisponible) {
      const itemEnCarrito = items.find(item => item.id === selectedProduct.id);
      const cantidadEnCarrito = itemEnCarrito ? itemEnCarrito.cantidad : 0;
      
      const errorMsg = cantidadEnCarrito > 0 
        ? `Stock insuficiente. Ya tienes ${cantidadEnCarrito} en el carrito. Solo puedes agregar ${stockRealDisponible} más.`
        : `Stock insuficiente. Solo hay ${stockRealDisponible} unidades disponibles.`;
      
      return { success: false, items, selectedProduct, selectedProductForSelect: null, error: errorMsg };
    }
    
    const updatedItems = [...items];
    const itemExistente = updatedItems.find(item => item.id === selectedProduct.id);
    
    if (itemExistente) {
      itemExistente.cantidad += cantidad;
      itemExistente.subtotal = itemExistente.cantidad * selectedProduct.precioVenta;
    } else {
      const nuevoItem = VentaFormService.crearItemVenta(selectedProduct, cantidad);
      updatedItems.push(nuevoItem);
    }

    guardarItemsCallback();
    calcularTotalesCallback();

    // Reset product selection
    form.patchValue({
      producto_id: '',
      cantidad: ''
    });
    
    VentaFormService.limpiarValidacionesCantidad(form);
    
    return { 
      success: true, 
      items: updatedItems, 
      selectedProduct: null, 
      selectedProductForSelect: null 
    };
  }

  handleEliminarItem(
    index: number,
    items: ItemVenta[],
    selectedProduct: TodosInventario | null,
    form: FormGroup,
    inventarioItems: TodosInventario[],
    guardarItemsCallback: () => void,
    calcularTotalesCallback: () => void
  ): ItemVenta[] {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    
    guardarItemsCallback();
    calcularTotalesCallback();
    
    // Si tenemos un producto seleccionado, actualizar su información de stock
    if (selectedProduct) {
      const stockRealDisponible = VentaFormService.getStockRestante(
        selectedProduct.id, 
        updatedItems, 
        inventarioItems
      );
      const cantidadActual = form.get('cantidad')?.value;
      
      if (cantidadActual && Number(cantidadActual) > stockRealDisponible) {
        form.patchValue({
          cantidad: stockRealDisponible > 0 ? stockRealDisponible.toString() : ''
        });
      }
    }
    
    return updatedItems;
  }
}
