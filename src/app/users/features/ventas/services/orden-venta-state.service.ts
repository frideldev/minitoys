import { Injectable, signal, computed } from '@angular/core';
import { ItemVenta } from '../interfaces/item-venta.interface';
import { Cliente } from '../../../interfaces/cliente.interface';

@Injectable({ providedIn: 'root' })
export class OrdenVentaStateService {
  private _productos = signal<ItemVenta[]>([]);
  private _cliente = signal<Cliente | null>(null);

  readonly productos = this._productos.asReadonly();
  readonly cliente = this._cliente.asReadonly();

  readonly totalProductos = computed(() =>
    this._productos().reduce((sum, p) => sum + p.subtotal, 0)
  );
  readonly totalOrden = computed(() => this.totalProductos());
  readonly tieneItems = computed(() => this._productos().length > 0);
  readonly cantidadItems = computed(() => this._productos().length);

  setCliente(cliente: Cliente | null): void {
    this._cliente.set(cliente);
  }

  setProductos(productos: ItemVenta[]): void {
    this._productos.set([...productos]);
  }

  removeProducto(id: number): void {
    this._productos.update(productos => productos.filter(p => p.id !== id));
  }

  clear(): void {
    this._productos.set([]);
    this._cliente.set(null);
  }
}
