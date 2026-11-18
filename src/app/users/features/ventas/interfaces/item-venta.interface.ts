export interface ItemVenta {
  id: number;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface NuevoCliente {
  nombre: string;
  apellido: string;
  celular: string;
}
