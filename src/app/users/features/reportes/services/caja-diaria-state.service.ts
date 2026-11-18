import { Injectable, inject } from '@angular/core';
import { signalSlice } from 'ngxtension/signal-slice';
import { Subject, catchError, concat, map, of, switchMap, tap, combineLatest } from 'rxjs';
import { CajaDiariaService, VentaDetallada, ResumenCaja, VentasDelDiaResponse } from './caja-diaria.service';
import { AuthStateService } from '../../../../auth/services/auth-state.service';
import { FormasPagoService } from '../../../services/formaspago.service';
import { FormaPago } from '../../../interfaces/formapago.interface';

interface State {
  ventas: VentaDetallada[];
  ventasPendientesTodas: VentaDetallada[];
  fechaConsultada: string | null;
  resumenCaja: ResumenCaja | null;
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
  cierreEnProceso: boolean;
  reciboHtml: string | null;
  reciboLoading: boolean;
  cajaCerrada: boolean;
  mensajeCierre: string | null;
  formasPago: FormaPago[]; // Cache de formas de pago
}

@Injectable({
  providedIn: 'root'
})
export class CajaDiariaStateService {
  private cajaDiariaService = inject(CajaDiariaService);
  private authStateService = inject(AuthStateService);
  private formasPagoService = inject(FormasPagoService);

  // Subjects para triggers
  private loadVentasSubject = new Subject<string>();
  private loadPendientesSubject = new Subject<void>();
  private realizarCierreSubject = new Subject<string>();
  private refreshSubject = new Subject<void>();
  private loadReciboSubject = new Subject<number>();
  private clearReciboSubject = new Subject<void>();

  private initialState: State = {
    ventas: [],
    ventasPendientesTodas: [],
    fechaConsultada: null,
    resumenCaja: null,
    status: 'idle',
    error: null,
    cierreEnProceso: false,
    reciboHtml: null,
    reciboLoading: false,
    cajaCerrada: false,
    mensajeCierre: null,
    formasPago: []
  };

  state = signalSlice({
    initialState: this.initialState,
    sources: [
      // Cargar ventas por fecha con integración de formas de pago
      (state) => this.loadVentasSubject.pipe(
        tap(() => ({ status: 'loading' as const })),
        switchMap((fecha) => 
          // Combinar ventas con formas de pago para cálculos precisos
          combineLatest([
            this.cajaDiariaService.getVentasDelDia(fecha),
            this.formasPagoService.getFormasPago()
          ]).pipe(
            map(([ventasResponse, formasPago]: [VentasDelDiaResponse, FormaPago[]]) => ({
              ventas: ventasResponse.caja_cerrada ? [] : ventasResponse.ventas,
              fechaConsultada: ventasResponse.fecha_consultada,
              formasPago: formasPago,
              resumenCaja: this.calcularResumenFromVentas(ventasResponse.ventas, ventasResponse.fecha_consultada, formasPago),
              cajaCerrada: ventasResponse.caja_cerrada || false,
              mensajeCierre: ventasResponse.caja_cerrada ? 
                (ventasResponse.mensaje_cierre || `La caja del día ${ventasResponse.fecha_consultada} ya fue cerrada. No se pueden realizar modificaciones.`) : null,
              status: 'success' as const,
              error: null
            })),
            catchError(error => {
              // Handle authentication errors
              this.authStateService.handleAuthError(error);
              
              return of({
                ventas: [],
                fechaConsultada: fecha,
                formasPago: [],
                resumenCaja: null,
                cajaCerrada: false,
                mensajeCierre: null,
                status: 'error' as const,
                error: error.message || 'Error al cargar las ventas'
              });
            })
          )
        )
      ),
      // Refresh trigger con integración de formas de pago
      (state) => this.refreshSubject.pipe(
        switchMap(() => {
          const fechaHoy = this.getFechaHoyFormateada();
          return combineLatest([
            this.cajaDiariaService.getVentasDelDia(fechaHoy),
            this.formasPagoService.getFormasPago()
          ]).pipe(
            map(([ventasResponse, formasPago]: [VentasDelDiaResponse, FormaPago[]]) => ({
              ventas: ventasResponse.caja_cerrada ? [] : ventasResponse.ventas,
              fechaConsultada: ventasResponse.fecha_consultada,
              formasPago: formasPago,
              resumenCaja: this.calcularResumenFromVentas(ventasResponse.ventas, ventasResponse.fecha_consultada, formasPago),
              cajaCerrada: ventasResponse.caja_cerrada || false,
              mensajeCierre: ventasResponse.caja_cerrada ? 
                (ventasResponse.mensaje_cierre || `La caja del día ${ventasResponse.fecha_consultada} ya fue cerrada. No se pueden realizar modificaciones.`) : null,
              status: 'success' as const,
              error: null
            })),
            catchError(error => {
              // Handle authentication errors
              this.authStateService.handleAuthError(error);
              
              return of({
                ventas: [],
                fechaConsultada: fechaHoy,
                formasPago: [],
                resumenCaja: null,
                cajaCerrada: false,
                mensajeCierre: null,
                status: 'error' as const,
                error: error.message || 'Error al cargar las ventas'
              });
            })
          );
        })
      ),
      // Cargar todas las ventas pendientes (sin filtro de fecha)
      (state) => this.loadPendientesSubject.pipe(
        switchMap(() =>
          this.cajaDiariaService.getVentasPendientes().pipe(
            map((pendientes) => ({ ventasPendientesTodas: pendientes })),
            catchError(() => of({ ventasPendientesTodas: [] }))
          )
        )
      ),
      // Cargar recibo HTML
      (state) => this.loadReciboSubject.pipe(
        switchMap((ventaId) => concat(
          of({ reciboLoading: true, reciboHtml: null as string | null, error: null }),
          this.cajaDiariaService.getReciboHtml(ventaId).pipe(
            map((htmlCompleto: string) => {
              // Si el HTML contiene <body>, extraer solo su contenido
              let htmlProcesado = htmlCompleto;
              
              if (htmlCompleto.includes('<body')) {
                const parser = new DOMParser();
                const doc = parser.parseFromString(htmlCompleto, 'text/html');
                const body = doc.querySelector('body');
                htmlProcesado = body ? body.innerHTML : htmlCompleto;
              }
              
              return {
                reciboHtml: htmlProcesado,
                reciboLoading: false,
                error: null
              };
            }),
            catchError(error => {
              console.error('Error al cargar recibo:', error);
              // Handle authentication errors
              this.authStateService.handleAuthError(error);
              
              return of({
                reciboHtml: null,
                reciboLoading: false,
                error: error.message || 'Error al cargar el recibo'
              });
            })
          )
        ))
      ),
      // Limpiar recibo
      (state) => this.clearReciboSubject.pipe(
        map(() => ({
          reciboHtml: null,
          reciboLoading: false
        }))
      )
    ],
    actionSources: {
      realizarCierre: (state) => this.realizarCierreSubject.pipe(
        tap(() => ({ cierreEnProceso: true })),
        switchMap((observaciones) => this.cajaDiariaService.realizarCierreCaja(observaciones).pipe(
          tap(() => this.refreshData()),
          map((resumen: ResumenCaja) => ({
            cierreEnProceso: false,
            resumenCaja: resumen,
            cajaCerrada: true,
            mensajeCierre: resumen.mensaje || `La caja del día ${resumen.fechaCierre} ha sido cerrada exitosamente. No se pueden realizar más modificaciones.`,
            ventas: [], // Limpiar ventas después del cierre
            status: 'success' as const,
            error: null
          })),
          catchError(error => {
            // Handle authentication errors
            this.authStateService.handleAuthError(error);
            
            return of({
              cierreEnProceso: false,
              status: 'error' as const,
              error: error.message || 'Error al realizar el cierre de caja'
            });
          })
        ))
      )
    }
  });

  /**
   * Carga las ventas de una fecha específica y también las ventas pendientes de todas las fechas
   */
  cargarVentasDelDia(fecha?: string) {
    const fechaFormateada = fecha ? this.formatearFecha(fecha) : this.getFechaHoyFormateada();
    this.loadVentasSubject.next(fechaFormateada);
    this.loadPendientesSubject.next();
  }

  /**
   * Realiza el cierre de caja
   */
  realizarCierreCaja(observaciones: string = '') {
    this.realizarCierreSubject.next(observaciones);
  }

  /**
   * Refresca los datos
   */
  refreshData() {
    this.refreshSubject.next();
    this.loadPendientesSubject.next();
  }

  /**
   * Carga el HTML del recibo para una venta
   */
  cargarRecibo(ventaId: number) {
    this.loadReciboSubject.next(ventaId);
  }

  /**
   * Limpia el recibo cargado
   */
  limpiarRecibo() {
    this.clearReciboSubject.next();
  }

  /**
   * Calcula el resumen basado en las ventas usando id_forma_pago real
   */
  private calcularResumenFromVentas(ventas: VentaDetallada[], fecha: string, formasPago: FormaPago[] = []): ResumenCaja {
    // CORREGIDO: Usar recogido = true para determinar ventas completadas
    const ventasCompletadas = ventas.filter(v => v.recogido === true);
    
    console.log('🎯 [CajaResumen] Filtrado de ventas completadas:', {
      totalVentas: ventas.length,
      ventasCompletadas: ventasCompletadas.length,
      ventasFiltradasPorRecogido: ventasCompletadas.map(v => ({
        id: v.id,
        total: v.total,
        precioTotal: v.precioTotal,
        recogido: v.recogido
      }))
    });
    
    // Mapear formas de pago por ID para búsqueda rápida
    const formasPagoMap = formasPago.reduce((map, fp) => {
      if (fp.id) {
        map[fp.id] = fp;
      }
      return map;
    }, {} as { [key: number]: FormaPago });
    
    const totalVentas = ventasCompletadas.reduce((sum, v) => {
      const montoVenta = v.precioTotal || v.total || 0;
      console.log(`💰 [CajaTotal] Sumando venta completada ${v.id}: precioTotal=${v.precioTotal}, total=${v.total}, usando=${montoVenta}, suma acumulada=${sum + montoVenta}`);
      return sum + montoVenta;
    }, 0);
    
    console.log('📊 [CajaResumen] Resultado final:', {
      ventasCompletadas: ventasCompletadas.length,
      totalCalculado: totalVentas
    });
    
    return {
      fechaCierre: fecha,
      totalVentas: totalVentas,
      totalEfectivo: ventasCompletadas
        .filter(v => this.esFormaPagoTipo(v.id_forma_pago, 'efectivo', formasPagoMap))
        .reduce((sum, v) => sum + (v.precioTotal || v.total || 0), 0),
      totalTarjeta: ventasCompletadas
        .filter(v => this.esFormaPagoTipo(v.id_forma_pago, 'tarjeta', formasPagoMap))
        .reduce((sum, v) => sum + (v.precioTotal || v.total || 0), 0),
      totalTransferencia: ventasCompletadas
        .filter(v => this.esFormaPagoTipo(v.id_forma_pago, 'transferencia', formasPagoMap))
        .reduce((sum, v) => sum + (v.precioTotal || v.total || 0), 0),
      numeroVentas: ventasCompletadas.length,
      ventasPendientes: ventas.filter(v => v.recogido === false).length
    };
  }

  /**
   * Determina si un id_forma_pago corresponde a un tipo específico usando datos reales del API
   */
  private esFormaPagoTipo(
    idFormaPago: number | undefined, 
    tipo: string, 
    formasPagoMap: { [key: number]: FormaPago } = {}
  ): boolean {
    if (!idFormaPago || !formasPagoMap[idFormaPago]) {
      // Fallback al mapeo básico si no hay datos del API
      return this.esFormaPagoTipoBasico(idFormaPago, tipo);
    }
    
    const formaPago = formasPagoMap[idFormaPago];
    const nombre = formaPago.nombre.toLowerCase();
    
    switch (tipo) {
      case 'efectivo':
        return nombre.includes('efectivo') || nombre.includes('cash');
      case 'tarjeta':
        return nombre.includes('tarjeta') || nombre.includes('card');
      case 'transferencia':
      case 'qr':
        return nombre.includes('transferencia') || nombre.includes('qr') || nombre.includes('digital');
      default:
        return false;
    }
  }

  /**
   * Mapeo básico por ID (fallback)
   */
  private esFormaPagoTipoBasico(idFormaPago: number | undefined, tipo: string): boolean {
    if (!idFormaPago) return false;
    
    // Mapeo temporal basado en IDs comunes
    switch (tipo) {
      case 'efectivo':
        return idFormaPago === 1; // Asumiendo que ID 1 es efectivo
      case 'tarjeta':
        return idFormaPago === 2; // Asumiendo que ID 2 es tarjeta
      case 'transferencia':
      case 'qr':
        return idFormaPago === 3; // Asumiendo que ID 3 es QR/transferencia
      default:
        return false;
    }
  }

  /**
   * Formatea fecha de YYYY-MM-DD a DD-MM-YY
   */
  private formatearFecha(fecha: string): string {
    const [year, month, day] = fecha.split('-');
    return `${day}-${month}-${year.slice(-2)}`;
  }

  /**
   * Obtiene la fecha de hoy formateada
   */
  private getFechaHoyFormateada(): string {
    const hoy = new Date();
    const day = hoy.getDate().toString().padStart(2, '0');
    const month = (hoy.getMonth() + 1).toString().padStart(2, '0');
    const year = hoy.getFullYear().toString().slice(-2);
    return `${day}-${month}-${year}`;
  }
}
