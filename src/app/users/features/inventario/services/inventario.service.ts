import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Producto } from '../interfaces/producto.interface';
import { MateriaPrimaVarilla, MateriaPrimaTrupan, MateriaPrimaVidrio, MateriaPrimaContorno } from '../interfaces/materia-prima.interface';
import { environment } from '../../../../../environments/environment';
import { InventarioResponse } from '../interfaces/inventario.interface';
import { map } from 'rxjs/operators';
import { PriceUtils } from '../../../../shared/utils/price.utils';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.API_URL;

  /** Normaliza una lista de ítems: convierte precioCompra y precioVenta de centavos a Bs */
  private normalizeList<T>(items: T[]): T[] {
    return items.map(item => PriceUtils.normalizeItem(item as any) as T);
  }

  /** Normaliza la respuesta paginada */
  private normalizeInventarioResponse(response: InventarioResponse): InventarioResponse {
    return { ...response, data: this.normalizeList(response.data) };
  }

  // Todos los Productos endpoints
  getTodoslosProductos(page: number = 1, perPage: number = 10): Observable<InventarioResponse> {
    return this.http.get<InventarioResponse>(
      `${this.baseUrl}/materias-primas-paginado?page=${page}&perPage=${perPage}`
    ).pipe(map(r => this.normalizeInventarioResponse(r)));
  }

  searchInventario(searchTerm: string): Observable<InventarioResponse> {
    return this.http.get<InventarioResponse>(`${this.baseUrl}/materias-primas-search?search=${searchTerm}`)
      .pipe(map(r => this.normalizeInventarioResponse(r)));
  }

  // Productos endpoints
  getProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.baseUrl}/productos`)
      .pipe(map(items => this.normalizeList(items)));
  }

  getProducto(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.baseUrl}/producto/${id}`)
      .pipe(map(item => PriceUtils.normalizeItem(item as any) as Producto));
  }

  createProducto(formData: FormData): Observable<Producto> {
    return this.http.post<Producto>(`${this.baseUrl}/producto`, formData);
  }

  updateProducto(id: number, formData: FormData): Observable<Producto> {
    return this.http.post<Producto>(`${this.baseUrl}/producto/edit/${id}`, formData);
  }

  deleteProducto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/producto/${id}`);
  }

  // Varillas endpoints
  getVarillas(): Observable<MateriaPrimaVarilla[]> {
    return this.http.get<MateriaPrimaVarilla[]>(`${this.baseUrl}/materiaPrimaVarillas`)
      .pipe(map(items => this.normalizeList(items)));
  }

  getVarilla(id: number): Observable<MateriaPrimaVarilla> {
    return this.http.get<MateriaPrimaVarilla>(`${this.baseUrl}/materiaPrimaVarilla/${id}`)
      .pipe(map(item => PriceUtils.normalizeItem(item as any) as MateriaPrimaVarilla));
  }

  createVarilla(varilla: MateriaPrimaVarilla): Observable<MateriaPrimaVarilla> {
    return this.http.post<MateriaPrimaVarilla>(`${this.baseUrl}/materiaPrimaVarilla`, varilla);
  }

  updateVarilla(id: number, varilla: MateriaPrimaVarilla): Observable<MateriaPrimaVarilla> {
    return this.http.post<MateriaPrimaVarilla>(`${this.baseUrl}/materiaPrimaVarilla/edit/${id}`, varilla);
  }

  deleteVarilla(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/materiaPrimaVarilla/${id}`);
  }

  // Trupan endpoints
  getTrupanes(): Observable<MateriaPrimaTrupan[]> {
    return this.http.get<MateriaPrimaTrupan[]>(`${this.baseUrl}/materiaPrimaTrupanes`)
      .pipe(map(items => this.normalizeList(items)));
  }

  getTrupan(id: number): Observable<MateriaPrimaTrupan> {
    return this.http.get<MateriaPrimaTrupan>(`${this.baseUrl}/materiaPrimaTrupan/${id}`)
      .pipe(map(item => PriceUtils.normalizeItem(item as any) as MateriaPrimaTrupan));
  }

  createTrupan(trupan: MateriaPrimaTrupan): Observable<MateriaPrimaTrupan> {
    return this.http.post<MateriaPrimaTrupan>(`${this.baseUrl}/materiaPrimaTrupan`, trupan);
  }

  updateTrupan(id: number, trupan: MateriaPrimaTrupan): Observable<MateriaPrimaTrupan> {
    return this.http.post<MateriaPrimaTrupan>(`${this.baseUrl}/materiaPrimaTrupan/edit/${id}`, trupan);
  }

  deleteTrupan(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/materiaPrimaTrupan/${id}`);
  }

  // Vidrio endpoints
  getVidrios(): Observable<MateriaPrimaVidrio[]> {
    return this.http.get<MateriaPrimaVidrio[]>(`${this.baseUrl}/materiaPrimaVidrios`)
      .pipe(map(items => this.normalizeList(items)));
  }

  getVidrio(id: number): Observable<MateriaPrimaVidrio> {
    return this.http.get<MateriaPrimaVidrio>(`${this.baseUrl}/materiaPrimaVidrio/${id}`)
      .pipe(map(item => PriceUtils.normalizeItem(item as any) as MateriaPrimaVidrio));
  }

  createVidrio(vidrio: MateriaPrimaVidrio): Observable<MateriaPrimaVidrio> {
    return this.http.post<MateriaPrimaVidrio>(`${this.baseUrl}/materiaPrimaVidrio`, vidrio);
  }

  updateVidrio(id: number, vidrio: MateriaPrimaVidrio): Observable<MateriaPrimaVidrio> {
    return this.http.post<MateriaPrimaVidrio>(`${this.baseUrl}/materiaPrimaVidrio/edit/${id}`, vidrio);
  }

  deleteVidrio(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/materiaPrimaVidrio/${id}`);
  }

  // Contorno endpoints
  getContornos(): Observable<MateriaPrimaContorno[]> {
    return this.http.get<MateriaPrimaContorno[]>(`${this.baseUrl}/materiaPrimaContornos`)
      .pipe(map(items => this.normalizeList(items)));
  }

  getContorno(id: number): Observable<MateriaPrimaContorno> {
    return this.http.get<MateriaPrimaContorno>(`${this.baseUrl}/materiaPrimaContorno/${id}`)
      .pipe(map(item => PriceUtils.normalizeItem(item as any) as MateriaPrimaContorno));
  }

  createContorno(contorno: MateriaPrimaContorno): Observable<MateriaPrimaContorno> {
    return this.http.post<MateriaPrimaContorno>(`${this.baseUrl}/materiaPrimaContorno`, contorno);
  }

  updateContorno(id: number, contorno: MateriaPrimaContorno): Observable<MateriaPrimaContorno> {
    return this.http.post<MateriaPrimaContorno>(`${this.baseUrl}/materiaPrimaContorno/edit/${id}`, contorno);
  }

  deleteContorno(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/materiaPrimaContorno/${id}`);
  }

  // Update getProductosPorTipo to include contorno
  getProductosPorTipo(tipo: string): Observable<InventarioResponse> {
    let response$: Observable<any>;

    switch (tipo.toLowerCase()) {
      case 'producto':
        response$ = this.http.get<Producto[]>(`${this.baseUrl}/productos`);
        break;
      case 'varilla':
        response$ = this.http.get<InventarioResponse>(`${this.baseUrl}/materiaPrimaVarillas`);
        break;
      case 'trupan':
        response$ = this.http.get<InventarioResponse>(`${this.baseUrl}/materiaPrimaTrupanes`);
        break;
      case 'vidrio':
        response$ = this.http.get<InventarioResponse>(`${this.baseUrl}/materiaPrimaVidrios`);
        break;
      case 'contorno':
        response$ = this.http.get<InventarioResponse>(`${this.baseUrl}/materiaPrimaContornos`);
        break;
      default:
        return this.getTodoslosProductos();
    }

    return response$.pipe(
      map(response => {
        const rawData: any[] = response.data || response;
        // Inject the `tipo` field into each item since individual-type endpoints
        // don't include it in their response (unlike the "todos" endpoint).
        // IMPORTANT: `tipo` must be FIRST so that patchValue() processes it before other
        // fields — otherwise the tipo valueChanges subscriber wipes them after they're set.
        const dataWithTipo = rawData.map((item: any) => ({ tipo: tipo.toLowerCase(), ...item }));
        return {
          data: this.normalizeList(dataWithTipo),
          currentPage: response.currentPage || 1,
          totalItems: response.totalItems || rawData.length,
          totalPages: response.totalPages || 1
        };
      })
    );
  }
}