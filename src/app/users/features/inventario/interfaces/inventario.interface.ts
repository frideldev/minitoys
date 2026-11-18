export interface TodosInventario {
    id:number;
    tipo: string;
    codigo:string;
      descripcion: string;
      categoria_id: string;
      sub_categoria_id: string;
      precioCompra: number;
      precioVenta: number;
      stock: number;
      grosor: number;
  alto:number;
  largo:number;
  factor_desperdicio: number;
      stock_global_actual:number;
      stock_global_minimo: number;
      id_sucursal: number;
      imagen:string;
      actualizacion:string;
      id_lugar:number;
      visibilidad: number; // 0 = no visible en ventas, 1 = visible en ventas
}


export interface InventarioResponse {
    data: TodosInventario[];
    currentPage: number;
    totalItems: number;
    totalPages: number;
}