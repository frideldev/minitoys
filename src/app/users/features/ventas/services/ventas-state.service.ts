import { Injectable, inject, computed } from '@angular/core';
import { signalSlice } from 'ngxtension/signal-slice';
import { Venta, VentaCompleta, VentaProductoMarcoRequest } from '../interfaces/venta.interface';
import { VentasService } from './ventas.service';
import { EMPTY, Subject, catchError, concat, map, of, switchMap, tap } from 'rxjs';

interface State {
  ventas: Venta[];
  selectedVenta: VentaCompleta | null;
  currentPreventa: Venta | null;
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class VentasStateService {
  private ventasService = inject(VentasService);
  private createPreventaSubject = new Subject<VentaProductoMarcoRequest>();
  private completarVentaSubject = new Subject<{idVenta: number, idFormaPago: number}>();
  private cancelarVentaSubject = new Subject<number>();
  private getVentaCompletaSubject = new Subject<number>();
  private refreshSubject = new Subject<void>();
  private clearPreventaSubject = new Subject<void>();

  private initialState: State = {
    ventas: [],
    selectedVenta: null,
    currentPreventa: null,
    status: 'idle',
    error: null
  };

  state = signalSlice({
    initialState: this.initialState,
    sources: [
      // Cargar ventas
      (state) => this.refreshSubject.pipe(
        switchMap(() => this.ventasService.getVentas().pipe(
          map(ventas => {
            console.log('📡 [VentasState] Ventas recibidas del API:', {
              total: ventas.length,
              marcosEncontrados: ventas.filter(v => v.detalle_venta_personalizadas && v.detalle_venta_personalizadas.length > 0).length,
              productosEncontrados: ventas.filter(v => v.detalle_venta_productos && v.detalle_venta_productos.length > 0).length,
              ventasRecientes: ventas.slice(0, 3).map(v => ({
                id: v.id,
                recogido: v.recogido,
                tieneMarcos: !!(v.detalle_venta_personalizadas && v.detalle_venta_personalizadas.length > 0),
                tieneProductos: !!(v.detalle_venta_productos && v.detalle_venta_productos.length > 0),
                saldo: v.saldo,
                total: v.precioTotal
              }))
            });
            
            // Ordenar ventas por fecha descendente (más recientes primero, más antiguas al final)
            const ventasOrdenadas = [...ventas].sort((a, b) => {
              const fechaA = new Date(a.fecha || a.created_at || 0);
              const fechaB = new Date(b.fecha || b.created_at || 0);
              
              // Orden descendente: fechas más recientes primero
              const diff = fechaB.getTime() - fechaA.getTime();
              
              // Si las fechas son iguales, ordenar por ID descendente (mayor primero)
              if (diff === 0) {
                return b.id - a.id;
              }
              
              return diff;
            });
            
            return {
              ventas: ventasOrdenadas,
              status: 'success' as const,
              error: null
            };
          }),
          catchError(error => of({
            ventas: [] as Venta[],
            status: 'error' as const,
            error: error.error?.error || error.error?.message || error.message || 'Error al cargar las ventas'
          }))
        ))
      ),
      // Obtener venta completa
      (state) => this.getVentaCompletaSubject.pipe(
        switchMap((id) => this.ventasService.getVentaCompleta(id).pipe(
          map(venta => ({
            selectedVenta: venta,
            status: 'success' as const,
            error: null
          })),
          catchError(error => of({
            selectedVenta: null,
            status: 'error' as const,
            error: error.error?.error || error.error?.message || error.message || 'Error al cargar la venta'
          }))
        ))
      )
    ],
    actionSources: {
      createPreventa: (state) => this.createPreventaSubject.pipe(
        switchMap((ventaRequest) =>
          concat(
            of({ currentPreventa: null as Venta | null, status: 'loading' as const, error: null }),
            this.ventasService.createPreventa(ventaRequest).pipe(
              map((venta) => ({
                currentPreventa: venta,
                status: 'success' as const,
                error: null
              })),
              tap(() => this.refreshData()),
              catchError(error => {
                console.error('❌ VentasStateService.createPreventa() - Error completo:', {
                  error: error,
                  message: error.message,
                  errorBody: error.error,
                  status: error.status,
                  statusText: error.statusText,
                  url: error.url
                });
                return of({
                  currentPreventa: null,
                  status: 'error' as const,
                  error: error.error?.error || error.error?.message || error.message || 'Error al crear la preventa'
                });
              })
            )
          )
        )
      ),
      completarVenta: (state) => this.completarVentaSubject.pipe(
        switchMap(({idVenta, idFormaPago}) => 
          this.ventasService.completarVenta(idVenta, idFormaPago).pipe(
            map((venta) => ({
              currentPreventa: null,
              status: 'success' as const,
              error: null
            })),
            tap(() => this.refreshData()),
            catchError(error => {
              console.error('❌ VentasStateService.completarVenta() - Error completo:', {
                error: error,
                message: error.message,
                errorBody: error.error,
                status: error.status,
                statusText: error.statusText,
                url: error.url,
                idVenta,
                idFormaPago
              });
              return of({
                status: 'error' as const,
                error: error.error?.error || error.error?.message || error.message || 'Error al completar la venta'
              });
            })
          )
        )
      ),
      cancelarVenta: (state) => this.cancelarVentaSubject.pipe(
        switchMap((id) => 
          this.ventasService.cancelarVenta(id).pipe(
            map(() => ({
              currentPreventa: null,
              status: 'success' as const,
              error: null
            })),
            tap(() => this.refreshData()),
            catchError(error => of({
              status: 'error' as const,
              error: error.error?.error || error.error?.message || error.message || 'Error al cancelar la venta'
            }))
          )
        )
      ),
      clearPreventa: (_state) => this.clearPreventaSubject.pipe(
        map(() => ({ currentPreventa: null as Venta | null }))
      )
    }
  });

  createPreventa(ventaRequest: VentaProductoMarcoRequest) {
    this.createPreventaSubject.next(ventaRequest);
  }

  completarVenta(idVenta: number, idFormaPago: number) {
    this.completarVentaSubject.next({idVenta, idFormaPago});
  }

  cancelarVenta(id: number) {
    this.cancelarVentaSubject.next(id);
  }

  getVentaCompleta(id: number) {
    this.getVentaCompletaSubject.next(id);
  }

  refreshData() {
    this.refreshSubject.next();
  }

  /**
   * Obtiene el total de todas las ventas
   */
  getVentasTotal() {
    return this.state().ventas.reduce((total, venta) => total + (venta.precioTotal || 0), 0);
  }

  /**
   * Obtiene el total de ventas como signal computado
   */
  getVentasTotalSignal() {
    return computed(() => 
      this.state().ventas.reduce((total: number, venta: Venta) => total + (venta.precioTotal || 0), 0)
    );
  }

  /**
   * Obtiene el número total de ventas
   */
  getVentasCount() {
    return this.state().ventas.length;
  }

  /**
   * Obtiene el número de preventas (ventas con saldo pendiente de pago)
   */
  getPreventasCount() {
    return this.state().ventas.filter(venta => venta.saldo < venta.precioTotal).length;
  }

  clearCurrentPreventa() {
    this.clearPreventaSubject.next();
  }

  clearSelectedVenta() {
    this.refreshData();
  }
}
