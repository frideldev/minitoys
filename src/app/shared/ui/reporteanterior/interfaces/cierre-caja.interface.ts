export interface CierreCaja {
  id: number;
  fecha: string;
  mes: string;
  año: number;
  montoTotal: number;
  cantidadVentas: number;
  ventasPendientes: number;
  pdfUrl: string;
  estado: 'cerrado' | 'pendiente';
}

export interface FiltroCierreCaja {
  mes: string;
  año: number;
  busqueda: string;
}

export interface PaginacionCierreCaja {
  paginaActual: number;
  totalPaginas: number;
  itemsPorPagina: number;
  totalItems: number;
}

export interface ResponseCierreCaja {
  cierres: CierreCaja[];
  paginacion: PaginacionCierreCaja;
}
