export interface DetalleVenta {
  idProducto: number;
  cantidad: number;
}

export interface DetalleVentaProducto {
  id: number;
  cantidad: number;
  precio: number;
  idVenta: number;
  idProducto: number;
  id_stock_producto: number;
  created_at: string;
  updated_at: string;
}

export interface DetalleVentaPersonalizada {
  id: number;
  created_at: string;
  updated_at: string;
  lado_a: number;
  lado_b: number;
  id_materia_prima_varillas?: number | null;
  id_materia_prima_trupans?: number | null;
  id_materia_prima_vidrios?: number | null;
  id_materia_prima_contornos?: number | null;
  id_venta: number;
  materia_prima_varilla?: any;
  materia_prima_trupan?: any;
  materia_prima_vidrio?: any;
  materia_prima_contorno?: any;
}

export interface CuadroVenta {
  lado_a: number;
  lado_b: number;
  id_materia_prima_varillas?: number;
  id_materia_prima_trupans?: number;
  id_materia_prima_vidrios?: number;
  id_materia_prima_contornos?: number;
  cantidad: number;
}

export interface VentaProductoMarcoRequest {
  pago: number;           // Nuevo: 0=sin pago inicial, >0=pago/adelanto realizado
  entregado: boolean;     // Nuevo: false=pendiente, true=entregado (recogido)
  adelanto?: number;      // Nuevo: monto del adelanto (opcional)
  saldo: number;          // Mantener compatibilidad: monto pagado/adelantado
  idCliente: number;
  idUsuario: number;
  idSucursal: number;
  idFormaPago: number;
  fechaEntrega?: string;  // Nuevo: fecha de entrega programada
  factorPrecioVenta?: number; // Factor de multiplicación para calcular precio de venta desde costo (ej: 2.5)
  descuento?: number;     // Monto de descuento aplicado al total
  detalles: DetalleVenta[];
  cuadros?: CuadroVenta[];
}

export interface VentaRequest {
  precioProducto?: number;
  precioPerzonalizado?: number;
  precioTotal?: number;
  saldo: number; // Monto adelantado/pagado
  idCliente: number;
  idSucursal: number;
  idFormaPago: number;
  idUsuario: number;
  detalles: DetalleVenta[];
}

export interface Venta {
  id: number;
  pago: number;           // Nuevo: 0=sin pago inicial, >0=pago/adelanto realizado
  entregado: boolean;     // Nuevo: false=pendiente, true=entregado
  adelanto?: number;      // Nuevo: monto del adelanto
  saldo: number;          // Mantener compatibilidad: monto pagado/adelantado
  idCliente: number;
  idSucursal: number;
  idUsuario: number;
  recogido: boolean;      // Mantener compatibilidad con entregado
  fecha: string;
  fechaEntrega?: string;
  saldoFalante: number;
  precioProducto: number;
  precioTotal: number;
  created_at: string;
  updated_at: string;
  cliente?: {
    id: number;
    ci: string;
    nombre: string;
    apellido: string;
    fechaNacimiento: string;
    telefono: string;
    direccion: string;
    email: string;
    created_at: string;
    updated_at: string;
  };
  sucursal?: {
    id: number;
    lugar: string;
    created_at: string;
    updated_at: string;
  };
  detalle_venta_productos?: DetalleVentaProducto[];
  detalle_venta_personalizadas?: DetalleVentaPersonalizada[];
  detalles?: DetalleVenta[]; // Legacy compatibility
}

export interface VentaCompleta extends Omit<Venta, 'cliente' | 'sucursal'> {
  cliente?: {
    id: number;
    nombre: string;
    apellido: string;
    full_name: string;
  };
  sucursal?: {
    id: number;
    nombre: string;
  };
  formaPago?: {
    id: number;
    nombre: string;
  };
  usuario?: {
    id: number;
    nombre: string;
  };
  productos?: {
    id: number;
    descripcion: string;
    precio: number;
    cantidad: number;
    subtotal: number;
  }[];
}
