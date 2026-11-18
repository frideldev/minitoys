export interface MateriaPrimaVarilla {
  id?: number; // Opcional para creación, requerido en respuestas
  codigo:string;
  descripcion: string;
  grosor: number;
  alto:number;
  largo:number;
  precioCompra: number;
  precioVenta: number;
  factor_desperdicio: number;
  categoria_id: string;
  sub_categoria_id: string;
  stock_global_actual: number;
  stock_global_minimo: number;
  id_sucursal: number;
  imagen:string;
  visibilidad: number; // 0 = no visible en ventas, 1 = visible en ventas
}

export interface MateriaPrimaTrupan {
  id?: number; // Opcional para creación, requerido en respuestas
  codigo:string;
  descripcion: string;
  grosor: number;
  alto:number;
  largo:number;
  precioCompra: number;
  precioVenta: number;
  factor_desperdicio: number;
  categoria_id: string;
  sub_categoria_id: string;
  stock_global_actual: number;
  stock_global_minimo: number;
  id_sucursal: number;
  imagen:string;
  visibilidad: number; // 0 = no visible en ventas, 1 = visible en ventas
}

export interface MateriaPrimaVidrio {
  id?: number; // Opcional para creación, requerido en respuestas
  codigo:string;
  descripcion: string;
  grosor: number;
  alto:number;
  largo:number;
  precioCompra: number;
  precioVenta: number;
  factor_desperdicio: number;
  categoria_id: string;
  sub_categoria_id: string;
  stock_global_actual: number;
  stock_global_minimo: number;
  id_sucursal: number;
  imagen:string;
  visibilidad: number; // 0 = no visible en ventas, 1 = visible en ventas
}
export interface MateriaPrimaContorno {
  id?: number; // Opcional para creación, requerido en respuestas
  codigo:string;
  descripcion: string;
  grosor: number;
  alto:number;
  largo:number;
  precioCompra: number;
  precioVenta: number;
  factor_desperdicio: number;
  categoria_id: string;
  sub_categoria_id: string;
  stock_global_actual: number;
  stock_global_minimo: number;
  id_sucursal: number;
  imagen:string;
  visibilidad: number; // 0 = no visible en ventas, 1 = visible en ventas
}