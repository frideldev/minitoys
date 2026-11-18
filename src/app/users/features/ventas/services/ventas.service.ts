import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable, forkJoin, of } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import { environment } from "../../../../../environments/environment";
import { VentaRequest, Venta, VentaCompleta, VentaProductoMarcoRequest } from "../interfaces/venta.interface";

@Injectable({
    providedIn: 'root'
})
export class VentasService {
    private http = inject(HttpClient);
    private readonly baseUrl = environment.API_URL;

    // POST - Crear preventa usando la nueva API unificada
    createPreventa(venta: VentaProductoMarcoRequest): Observable<Venta> {
        console.log('🚀 VentasService.createPreventa() - Enviando POST:', {
            url: `${this.baseUrl}/ventaProductoMarco`,
            method: 'POST',
            body: venta
        });
        return this.http.post<Venta>(`${this.baseUrl}/ventaProductoMarco`, venta);
    }

    // POST - Método legacy mantenido para compatibilidad
    createPreventaLegacy(venta: VentaRequest): Observable<Venta> {
        return this.http.post<Venta>(`${this.baseUrl}/venta/ventasConDetalle`, venta);
    }

    // GET - Obtener venta completa por ID
    getVentaCompleta(id: number): Observable<VentaCompleta> {
        return this.http.get<VentaCompleta>(`${this.baseUrl}/venta/ventaCompleta/${id}`);
    }

    // PUT - Completar venta (reemplazando la API anterior /venta/completar/{id})
    completarVenta(idVenta: number, idFormaPago: number): Observable<any> {
        console.log('🚀 VentasService.completarVenta() - Enviando a nueva API:', {
            url: `${this.baseUrl}/pago/completar`,
            method: 'POST',
            body: { idVenta, idFormaPago }
        });
        
        return this.http.post(`${this.baseUrl}/pago/completar`, {
            idVenta,
            idFormaPago
        });
    }

    // PUT - Completar venta (método legacy usando GET+PUT - mantenido por compatibilidad)
    completarVentaLegacy(id: number): Observable<any> {
    // IMPORTANTE: Ahora usamos el endpoint unificado /ventaProductoMarco
    // Para completar, necesitamos obtener la preventa y actualizar su estado
    return this.http.get(`${this.baseUrl}/venta/${id}`).pipe(
      switchMap((preventa: any) => {
        // Determinar si debe marcarse como recogido basado en la forma de pago
        const formaPago = preventa.forma_pago?.nombre?.toLowerCase() || '';
        const esQRoEfectivo = formaPago.includes('qr') || formaPago.includes('efectivo');
        
        const ventaCompleta = {
          ...preventa,
          saldo: 0, // Completar la venta (sin saldo pendiente)
          recogido: esQRoEfectivo, // true para QR/efectivo, false para otros
          idFormaPago: preventa.idFormaPago || preventa.id_forma_pago
        };
        
        // Usar el endpoint unificado para actualizar
        return this.http.put(`${this.baseUrl}/ventaProductoMarco/${id}`, ventaCompleta);
      })
    );
  }

    // DELETE - Cancelar/eliminar venta (preventa)
    cancelarVenta(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/venta/${id}`);
    }

    // GET - Obtener todas las ventas (maneja paginación automáticamente)
    getVentas(): Observable<Venta[]> {
        interface PageResponse {
            message: string;
            ventas: Venta[];
            currentPage: number;
            totalPages: number;
            totalItems: number;
            perPage: number;
        }

        const fetchPage = (page: number): Observable<PageResponse> =>
            this.http.get<PageResponse>(`${this.baseUrl}/ventaProductoMarco`, {
                params: { per_page: '50', page: String(page) }
            });

        // Fetch primera página, luego todas las demás en paralelo con forkJoin
        return fetchPage(1).pipe(
            switchMap(firstPage => {
                console.log(`📄 [VentasService] Página 1/${firstPage.totalPages} - ${firstPage.ventas.length} ventas`);

                if (firstPage.totalPages <= 1) {
                    return of(firstPage.ventas ?? []);
                }

                // Construir array de requests para las páginas restantes
                const pageNumbers = Array.from(
                    { length: firstPage.totalPages - 1 },
                    (_, i) => i + 2
                );
                const remainingRequests = pageNumbers.map(p => fetchPage(p));

                return forkJoin(remainingRequests).pipe(
                    map(pages => {
                        const allVentas = [
                            ...(firstPage.ventas ?? []),
                            ...pages.flatMap(p => p.ventas ?? [])
                        ];
                        console.log(`✅ [VentasService] Total ventas cargadas: ${allVentas.length}`);
                        return allVentas;
                    })
                );
            })
        );
    }

    getVenta(id: number): Observable<Venta> {
        return this.http.get<Venta>(`${this.baseUrl}/venta/${id}`);
    }

    deleteVenta(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/venta/${id}`);
    }
}
