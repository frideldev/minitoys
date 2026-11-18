import { TestBed } from '@angular/core/testing';
import { OrdenVentaStateService } from './orden-venta-state.service';
import { ItemVenta } from '../interfaces/item-venta.interface';
import { Cliente } from '../../../interfaces/cliente.interface';

const productoFoto: ItemVenta = { id: 1, descripcion: 'Foto 10x15', cantidad: 2, precioUnitario: 5.00, subtotal: 10.00 };
const productoAlbum: ItemVenta = { id: 2, descripcion: 'Álbum 20x25', cantidad: 1, precioUnitario: 35.00, subtotal: 35.00 };

const clienteTest: Cliente = {
  id: 42,
  nombre: 'Ana',
  apellido: 'García',
  telefono: '71234567',
  full_name: 'Ana García',
} as Cliente;

describe('OrdenVentaStateService', () => {
  let service: OrdenVentaStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrdenVentaStateService);
    service.clear();
  });

  it('debería crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  describe('estado inicial', () => {
    it('debería tener productos vacíos y sin cliente', () => {
      expect(service.productos()).toEqual([]);
      expect(service.cliente()).toBeNull();
      expect(service.tieneItems()).toBeFalse();
      expect(service.cantidadItems()).toBe(0);
      expect(service.totalOrden()).toBe(0);
    });
  });

  describe('productos', () => {
    it('debería agregar productos y calcular totales', () => {
      service.setProductos([productoFoto, productoAlbum]);

      expect(service.productos().length).toBe(2);
      expect(service.totalProductos()).toBe(45.00);
      expect(service.totalOrden()).toBe(45.00);
      expect(service.tieneItems()).toBeTrue();
      expect(service.cantidadItems()).toBe(2);
    });

    it('debería eliminar un producto por id', () => {
      service.setProductos([productoFoto, productoAlbum]);
      service.removeProducto(productoFoto.id);

      expect(service.productos()).toEqual([productoAlbum]);
      expect(service.totalOrden()).toBe(35.00);
    });

    it('eliminar un id inexistente no altera la orden', () => {
      service.setProductos([productoFoto]);
      service.removeProducto(999);

      expect(service.productos().length).toBe(1);
    });
  });

  describe('cliente y limpieza', () => {
    it('debería guardar y limpiar el cliente', () => {
      service.setCliente(clienteTest);
      expect(service.cliente()).toEqual(clienteTest);

      service.setCliente(null);
      expect(service.cliente()).toBeNull();
    });

    it('clear debería vaciar productos y cliente', () => {
      service.setProductos([productoFoto]);
      service.setCliente(clienteTest);
      service.clear();

      expect(service.productos()).toEqual([]);
      expect(service.cliente()).toBeNull();
      expect(service.totalOrden()).toBe(0);
    });
  });
});
