import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, combineLatest } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { AuthStateService } from '../../../../auth/services/auth-state.service';
import { Venta } from '../../ventas/interfaces/venta.interface';
import { PriceUtils } from '../../../../shared/utils/price.utils';

export interface VentaDetallada {
  id: number;
  cliente_nombre?: string;
  cliente_telefono?: string;
  cliente_email?: string;
  fecha?: string;
  created_at?: string;
  precioTotal: number;
  saldo: number;
  forma_pago?: string;
  id_forma_pago?: number; // Campo agregado para identificar la forma de pago
  recogido?: boolean; // Campo agregado para saber si está completada
  detalle_venta_productos?: any[];
  detalle_venta_personalizadas?: any[];
  // Campos calculados para la vista
  hora: string;
  cliente: string;
  productos: string;
  total: number;
  estado: string;
}

export interface VentasDelDiaResponse {
  fecha_consultada: string;
  ventas: VentaDetallada[];
  caja_cerrada?: boolean;
  fecha_cierre?: string;
  mensaje_cierre?: string;
}

export interface ResumenCaja {
  fechaCierre: string;
  totalVentas: number;
  totalEfectivo: number;
  totalTarjeta: number;
  totalTransferencia: number;
  numeroVentas: number;
  ventasPendientes: number;
  caja_cerrada?: boolean;
  mensaje?: string;
}

// Interfaces reales basadas en la estructura del API backend
export interface CajaReal {
  id: number;
  detalle: { [key: string]: string }; // Objeto con id_forma_pago: monto
  total: number;
  ventas: number;
  fecha: string; // Formato YYYY-MM-DD
  id_usuario: number;
  created_at: string;
  updated_at: string;
}

export interface CajasResponse {
  cajas?: CajaReal[]; // Puede venir como array directo o con wrapper
  data?: CajaReal[]; // Algunos APIs usan 'data' como wrapper
  paginacion?: {
    pagina_actual: number;
    total_paginas: number;
    items_por_pagina: number;
    total_items: number;
  };
}

export interface CajaMesResponse {
  mes: string;
  año: number;
  cajas: CajaReal[];
  resumen?: {
    total_general: number;
    total_por_forma_pago: { [key: string]: number };
    numero_cajas: number;
    dias_trabajados: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class CajaDiariaService {
  private http = inject(HttpClient);
  private authStateService = inject(AuthStateService);
  private readonly baseUrl = environment.API_URL;

  /**
   * Obtiene las ventas del día desde la API unificada y verifica si la caja está cerrada
   */
  getVentasDelDia(fecha: string): Observable<VentasDelDiaResponse> {
    const currentUser = this.authStateService.getCurrentUser();
    if (!currentUser?.id) {
      throw new Error('Usuario no autenticado');
    }

    // Convertir formato DD-MM-YY a YYYY-MM-DD para la API
    const fechaISO = this.convertirFechaParaAPI(fecha);
    
    console.log('🌐 Haciendo llamada al API /ventaProductoMarco');
    console.log('📅 Fecha solicitada:', fecha);
    console.log('📅 Fecha ISO para API:', fechaISO);
    console.log('👤 Usuario ID:', currentUser.id);
    
    // Combinar llamadas: obtener ventas Y verificar si existe cierre de caja
    const ventas$ = this.http.get<{ message: string; ventas: Venta[] }>(`${this.baseUrl}/ventaProductoMarco`, {
      params: { 
        fecha_desde: fechaISO,
        fecha_hasta: fechaISO,
        per_page: '100' // Obtener hasta 100 ventas del día
      }
    });
    
    const cajas$ = this.getAllCajas(1, 100); // Obtener cajas para verificar cierre
    
    return combineLatest([ventas$, cajas$]).pipe(
      map(([ventasResponse, cajasResponse]) => {
        console.log('✅ Respuesta del API recibida:', ventasResponse);
        console.log('🔍 Verificando si existe cierre para fecha:', fechaISO);
        
        // Verificar si existe un cierre de caja para esta fecha
        const cajaCerrada = this.verificarCajaCerrada(fechaISO, cajasResponse);
        console.log('🔒 Caja cerrada?:', cajaCerrada);
        
        return this.convertirRespuestaAPI(ventasResponse, fecha, cajaCerrada);
      }),
      catchError((error) => {
        console.error('❌ Error al obtener ventas desde API:', error);
        return of(this.generarRespuestaVacia(fecha));
      })
    );
  }

  /**
   * Verifica si existe un cierre de caja para una fecha específica
   */
  private verificarCajaCerrada(fechaISO: string, cajasResponse: CajasResponse): boolean {
    const cajas = cajasResponse.cajas || [];
    
    // Buscar si existe una caja para esta fecha
    const cajaParaFecha = cajas.find(caja => caja.fecha === fechaISO);
    
    console.log('🔍 Buscando caja para fecha:', fechaISO);
    console.log('📦 Cajas disponibles:', cajas.map(c => ({ id: c.id, fecha: c.fecha })));
    console.log('🎯 Caja encontrada:', cajaParaFecha);
    
    return !!cajaParaFecha;
  }

  /**
   * Convierte la respuesta de la API unificada al formato esperado
   */
  private convertirRespuestaAPI(response: { message: string; ventas: Venta[] }, fechaConsultada: string, cajaCerrada: boolean = false): VentasDelDiaResponse {
    console.log('🔄 Convirtiendo respuesta del API...');
    console.log('📊 Cantidad de ventas en respuesta:', response.ventas?.length || 0);
    
    const ventasDetalladas: VentaDetallada[] = response.ventas.map(venta => {
      const ventaDetallada = this.convertirVentaADetallada(venta);
      console.log('🔍 Venta convertida:', {
        id: ventaDetallada.id,
        cliente: ventaDetallada.cliente,
        total: ventaDetallada.total,
        estado: ventaDetallada.estado,
        fecha: ventaDetallada.fecha
      });
      return ventaDetallada;
    });
    
    const resultado = {
      fecha_consultada: fechaConsultada,
      ventas: cajaCerrada ? [] : ventasDetalladas, // Si la caja está cerrada, no mostrar ventas
      caja_cerrada: cajaCerrada,
      mensaje_cierre: cajaCerrada ? `La caja del día ${fechaConsultada} ya fue cerrada. No se pueden realizar modificaciones.` : undefined
    };
    
    console.log('✅ Respuesta convertida:', resultado);
    return resultado;
  }

  /**
   * Convierte una Venta del API a VentaDetallada para la vista
   */
  private convertirVentaADetallada(venta: Venta): VentaDetallada {
    // Extraer hora de la fecha
    const fecha = new Date(venta.fecha || venta.created_at || '');
    const hora = fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    
    // Determinar cliente
    const cliente = venta.cliente ? `${venta.cliente.nombre} ${venta.cliente.apellido}` : 'Cliente sin nombre';
    
    // Construir descripción de productos
    let productos = '';
    const productosCount = venta.detalle_venta_productos?.length || 0;
    const marcosCount = venta.detalle_venta_personalizadas?.length || 0;
    
    if (productosCount > 0 && marcosCount > 0) {
      productos = `${productosCount} producto(s), ${marcosCount} marco(s)`;
    } else if (productosCount > 0) {
      productos = `${productosCount} producto(s)`;
    } else if (marcosCount > 0) {
      productos = `${marcosCount} marco(s) personalizado(s)`;
    } else {
      productos = 'Sin productos';
    }
    
    // CORREGIDO: Determinar estado basado en recogido
    const recogido = venta.recogido === true;
    const estado = recogido ? 'completado' : 'pendiente';
    
    console.log(`🔍 [VentaDetallada] Venta ${venta.id}: recogido=${recogido}, estado=${estado}, total=${venta.precioTotal}`);
    
    // Obtener id_forma_pago de la venta (viene en el JSON de la API)
    const idFormaPago = (venta as any).id_forma_pago || null;
    
    return {
      id: venta.id,
      cliente_nombre: venta.cliente?.nombre,
      cliente_telefono: venta.cliente?.telefono,
      cliente_email: venta.cliente?.email,
      fecha: venta.fecha,
      created_at: venta.created_at,
      precioTotal: PriceUtils.fromApi(venta.precioTotal),
      saldo: PriceUtils.fromApi(venta.saldo),
      forma_pago: '', // Se determinará dinámicamente por id_forma_pago
      recogido: recogido, // Campo agregado para saber si está completada
      detalle_venta_productos: venta.detalle_venta_productos,
      detalle_venta_personalizadas: venta.detalle_venta_personalizadas,
      // Agregamos id_forma_pago para usar en cálculos
      id_forma_pago: idFormaPago,
      // Campos calculados para la vista
      hora,
      cliente,
      productos,
      total: PriceUtils.fromApi(venta.precioTotal),
      estado
    };
  }

  /**
   * Convierte fecha de DD-MM-YY a YYYY-MM-DD para la API
   */
  private convertirFechaParaAPI(fecha: string): string {
    const [dia, mes, año] = fecha.split('-');
    const añoCompleto = año.length === 2 ? `20${año}` : año;
    return `${añoCompleto}-${mes}-${dia}`;
  }

  /**
   * Genera una respuesta vacía cuando el API falla - SIN datos de ejemplo
   */
  private generarRespuestaVacia(fecha: string): VentasDelDiaResponse {
    console.log('❌ API falló para fecha:', fecha);
    console.log('� Devolviendo respuesta vacía - sin datos de ejemplo');

    return {
      fecha_consultada: fecha,
      ventas: [], // Sin datos cuando el API falla
      caja_cerrada: false,
      mensaje_cierre: undefined
    };
  }

  /**
   * Obtiene la fecha de hoy formateada para comparación
   */
  private getFechaHoyFormateada(): string {
    const hoy = new Date();
    const day = hoy.getDate().toString().padStart(2, '0');
    const month = (hoy.getMonth() + 1).toString().padStart(2, '0');
    const year = hoy.getFullYear().toString().slice(-2);
    return `${day}-${month}-${year}`;
  }

  /**
   * Realiza el cierre de caja a través de la API
   */
  realizarCierreCaja(observaciones?: string): Observable<ResumenCaja> {
    const currentUser = this.authStateService.getCurrentUser();
    if (!currentUser?.id) {
      throw new Error('Usuario no autenticado');
    }

    const now = new Date();
    const fecha = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const body: Record<string, unknown> = { fecha, id_usuario: currentUser.id };
    if (observaciones && observaciones.trim()) {
      body['observaciones'] = observaciones.trim();
    }
    return this.http.post<ResumenCaja>(`${this.baseUrl}/caja`, body).pipe(
      catchError((error) => {
        console.error('❌ Error al realizar cierre desde API:', error);
        throw error; // Propagar el error para que se maneje en el componente
      })
    );
  }

  /**
   * Obtiene el HTML del recibo para una venta específica
   */
  getReciboHtml(ventaId: number): Observable<string> {
    const currentUser = this.authStateService.getCurrentUser();
    if (!currentUser?.id) {
      throw new Error('Usuario no autenticado');
    }

    return this.http.get(`${this.baseUrl}/recibo/html/${ventaId}`, { 
      responseType: 'text',
      params: {
        id_usuario: currentUser.id.toString()
      }
    }).pipe(
      catchError((error) => {
        console.error('❌ Error al obtener recibo desde API:', error);
        return of('Error: No se pudo obtener el recibo del servidor.');
      })
    );
  }

  /**
   * Obtiene todas las cajas históricas desde la API /cajas
   */
  getAllCajas(page: number = 1, perPage: number = 10): Observable<CajasResponse> {
    const currentUser = this.authStateService.getCurrentUser();
    if (!currentUser?.id) {
      throw new Error('Usuario no autenticado');
    }

    const url = `${this.baseUrl}/cajas/${currentUser.id_sucursal}`;
    console.log('🌐 [CajaDiaria] === LLAMADA AL API /cajas ===');
    console.log('📍 [CajaDiaria] URL completa:', url);
    console.log('📄 [CajaDiaria] Parámetros: página', page, ', por página', perPage);
    
    return this.http.get<CajaReal[] | CajasResponse>(url, {
      params: {
        page: page.toString(),
        per_page: perPage.toString()
      }
    }).pipe(
      map(response => {
        console.log('📦 [CajaDiaria] === RESPUESTA RECIBIDA ===');
        console.log('🏷️ [CajaDiaria] Tipo de respuesta:', typeof response);
        console.log('🏷️ [CajaDiaria] Es array?:', Array.isArray(response));
        console.log('📊 [CajaDiaria] Contenido completo:', JSON.stringify(response, null, 2));
        
        // El API puede devolver un array directo o un objeto con wrapper
        if (Array.isArray(response)) {
          console.log('📦 [CajaDiaria] Procesando como array directo con', response.length, 'elementos');
          
          // Log detallado de las fechas recibidas
          response.forEach((caja, index) => {
            console.log(`📅 [CajaDiaria] Caja ${index + 1}:`, {
              id: caja.id,
              fecha: caja.fecha,
              total: caja.total,
              ventas: caja.ventas,
              detalle: caja.detalle
            });
          });
          
          return this.procesarArrayCajas(response, page, perPage);
        } else {
          console.log('📦 [CajaDiaria] Procesando como objeto con wrapper');
          console.log('📊 [CajaDiaria] Claves del objeto:', Object.keys(response));
          return response as CajasResponse;
        }
      }),
      catchError((error) => {
        console.error('❌ [CajaDiaria] === ERROR EN API /cajas ===');
        console.error('❌ [CajaDiaria] Error completo:', error);
        console.error('❌ [CajaDiaria] Status:', error.status);
        console.error('❌ [CajaDiaria] Message:', error.message);
        console.error('❌ [CajaDiaria] URL que falló:', error.url);
        
        return of({
          cajas: [],
          paginacion: {
            pagina_actual: page,
            total_paginas: 0,
            items_por_pagina: perPage,
            total_items: 0
          }
        });
      })
    );
  }

  /**
   * Obtiene las cajas de un mes específico desde la API /caja/mes/{año-mes}
   */
  getCajasPorMes(año: number, mes: number): Observable<CajaMesResponse> {
    const currentUser = this.authStateService.getCurrentUser();
    if (!currentUser?.id) {
      throw new Error('Usuario no autenticado');
    }

    const mesFormateado = `${año}-${mes.toString().padStart(2, '0')}`;
    console.log('🌐 Haciendo llamada a /caja/mes para:', mesFormateado);
    
    return this.http.get<CajaMesResponse>(`${this.baseUrl}/caja/mes/${mesFormateado}`).pipe(
      catchError((error) => {
        console.error('❌ Error al obtener cajas del mes desde API:', error);
        return of({
          mes: this.obtenerNombreMes(mes),
          año,
          cajas: [],
          resumen: {
            total_general: 0,
            total_por_forma_pago: {},
            numero_cajas: 0,
            dias_trabajados: 0
          }
        });
      })
    );
  }

  /**
   * Descarga el PDF de reporte mensual desde la API /caja/pdf/{año-mes}
   */
  descargarPDFMensual(año: number, mes: number): void {
    const currentUser = this.authStateService.getCurrentUser();
    if (!currentUser?.id) {
      console.error('Usuario no autenticado');
      return;
    }

    const mesFormateado = `${año}-${mes.toString().padStart(2, '0')}`;
    const pdfUrl = `${this.baseUrl}/caja/pdf/mes/${mesFormateado}`;
    
    console.log('📄 Descargando PDF mensual desde:', pdfUrl);
    
    // Crear enlace temporal para descarga
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `reporte-caja-${mesFormateado}.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Descarga el PDF de reporte diario desde la API /caja/pdf/{año-mes-día}
   */
  descargarPDFDiario(fecha: string): void {
    const currentUser = this.authStateService.getCurrentUser();
    if (!currentUser?.id) {
      console.error('Usuario no autenticado');
      return;
    }

    // Determinar si la fecha necesita conversión o ya está en formato ISO
    let fechaISO: string;
    if (fecha.match(/^\d{4}-\d{2}-\d{2}$/)) {
      // Ya está en formato YYYY-MM-DD
      fechaISO = fecha;
      console.log('📄 Fecha ya en formato ISO:', fechaISO);
    } else if (fecha.match(/^\d{2}-\d{2}-\d{2,4}$/)) {
      // Está en formato DD-MM-YY o DD-MM-YYYY
      fechaISO = this.convertirFechaParaAPI(fecha);
      console.log('📄 Fecha convertida de DD-MM-YY a ISO:', fechaISO);
    } else {
      console.error('Formato de fecha no reconocido:', fecha);
      return;
    }
    
    const pdfUrl = `${this.baseUrl}/caja/pdf/${fechaISO}/${currentUser.id_sucursal}`;
    
    console.log('📄 Descargando PDF diario desde:', pdfUrl);
    
    // Crear enlace temporal para descarga
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `reporte-caja-${fechaISO}.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Obtiene el nombre del mes por número
   */
  private obtenerNombreMes(mes: number): string {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return meses[mes - 1] || 'Mes desconocido';
  }

  /**
   * Procesa un array directo de cajas del API
   */
  private procesarArrayCajas(cajas: CajaReal[], page: number, perPage: number): CajasResponse {
    console.log('🔄 Procesando array de cajas del API:', cajas);
    
    // Ordenar de más reciente a más antiguo
    const cajasOrdenadas = [...cajas].sort((a, b) => b.fecha.localeCompare(a.fecha));

    // Aplicar paginación local si es necesario
    const totalItems = cajasOrdenadas.length;
    const totalPaginas = Math.ceil(totalItems / perPage);
    const inicio = (page - 1) * perPage;
    const fin = inicio + perPage;
    const cajasPaginadas = cajasOrdenadas.slice(inicio, fin);

    return {
      cajas: cajasPaginadas,
      paginacion: {
        pagina_actual: page,
        total_paginas: totalPaginas,
        items_por_pagina: perPage,
        total_items: totalItems
      }
    };
  }

  /**
   * Obtiene todas las ventas pendientes (recogido=false) sin filtro de fecha
   */
  getVentasPendientes(): Observable<VentaDetallada[]> {
    const currentUser = this.authStateService.getCurrentUser();
    if (!currentUser?.id) {
      throw new Error('Usuario no autenticado');
    }

    return this.http.get<{ message: string; ventas: Venta[] }>(`${this.baseUrl}/ventaProductoMarco`, {
      params: { per_page: '200' }
    }).pipe(
      map(response => {
        const todas = (response.ventas || []).map(v => this.convertirVentaADetallada(v));
        return todas.filter(v => v.recogido === false);
      }),
      catchError((error) => {
        console.error('❌ Error al obtener ventas pendientes:', error);
        return of([]);
      })
    );
  }

  /**
   * Anula una venta por su ID
   */
  anularVenta(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/ventaProductoMarco/anular/${id}`, {}).pipe(
      catchError((error) => {
        console.error('❌ Error al anular venta:', error);
        throw error;
      })
    );
  }

  /**
   * Registra la devolución de una venta por su ID
   */
  devolverVenta(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/ventaProductoMarco/devolucion/${id}`, {}).pipe(
      catchError((error) => {
        console.error('❌ Error al registrar devolución:', error);
        throw error;
      })
    );
  }

  // NO más métodos de datos de ejemplo - solo conexión al API real
}
