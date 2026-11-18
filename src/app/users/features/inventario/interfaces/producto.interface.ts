export interface Producto {
  codigo:string;
  descripcion: string;
  precioCompra: number;
  precioVenta: number;
  stock_global_actual: number;
  stock_global_minimo: number;
  actualizacion: string;
  id_sucursal: number;
  categoria_id: number;
  sub_categoria: number;
  imagen: File | null;
  visibilidad: number; // 0 = no visible en ventas, 1 = visible en ventas
}