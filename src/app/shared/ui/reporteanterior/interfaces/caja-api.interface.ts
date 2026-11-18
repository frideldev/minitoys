export interface CajaAPI {
  id: number;
  fecha: string;
  total_ventas: number;
  total_efectivo: number;
  total_tarjeta: number;
  total_transferencia: number;
  numero_ventas: number;
  ventas_pendientes: number;
  estado: 'abierto' | 'cerrado';
  created_at: string;
  updated_at: string;
}

export interface CajaMesResponse {
  mes: string;
  año: number;
  cajas: CajaAPI[];
  resumen: {
    total_ventas: number;
    total_efectivo: number;
    total_tarjeta: number;
    total_transferencia: number;
    numero_cajas: number;
    dias_trabajados: number;
  };
}

export interface CajasResponse {
  cajas: CajaAPI[];
  paginacion?: {
    pagina_actual: number;
    total_paginas: number;
    items_por_pagina: number;
    total_items: number;
  };
}

export interface FiltroCajaAPI {
  fecha_desde?: string;
  fecha_hasta?: string;
  mes?: string;
  año?: number;
  estado?: 'abierto' | 'cerrado';
  per_page?: number;
  page?: number;
}