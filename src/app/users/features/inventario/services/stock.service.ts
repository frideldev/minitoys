import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { StockProducto, StockTrupan, StockVidrio, StockVarilla, StockContorno } from '../interfaces/stock.interface';

@Injectable({
  providedIn: 'root'
})
export class StockService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.API_URL;

  // Stock Producto
  getAllStockProducto(): Observable<StockProducto[]> {
    return this.http.get<StockProducto[]>(`${this.baseUrl}/stockProductos`);
  }

  getStockProducto(id: number): Observable<StockProducto> {
    return this.http.get<StockProducto>(`${this.baseUrl}/stockProducto/${id}`);
  }

  createStockProducto(stock: StockProducto): Observable<StockProducto> {
    return this.http.post<StockProducto>(`${this.baseUrl}/stockProducto`, stock);
  }

  updateStockProducto(id: number, stock: StockProducto): Observable<StockProducto> {
    return this.http.put<StockProducto>(`${this.baseUrl}/stockProducto/${id}`, stock);
  }

  deleteStockProducto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/stockProducto/${id}`);
  }

  // Stock Varilla
  getAllStockVarilla(): Observable<StockVarilla[]> {
    return this.http.get<StockVarilla[]>(`${this.baseUrl}/stockVarillas`);
  }

  getStockVarilla(id: number): Observable<StockVarilla> {
    return this.http.get<StockVarilla>(`${this.baseUrl}/stockVarilla/${id}`);
  }

  createStockVarilla(stock: StockVarilla): Observable<StockVarilla> {
    return this.http.post<StockVarilla>(`${this.baseUrl}/stockVarillas`, stock);
  }

  updateStockVarilla(id: number, stock: StockVarilla): Observable<StockVarilla> {
    return this.http.put<StockVarilla>(`${this.baseUrl}/stockVarilla/${id}`, stock);
  }

  deleteStockVarilla(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/stockVarilla/${id}`);
  }

  getStockVarillaPorVarilla(id: number): Observable<StockVarilla[]> {
    return this.http.get<StockVarilla[]>(`${this.baseUrl}/stockVarillas/porVarilla/${id}`);
  }

  // Stock Trupan
  getAllStockTrupan(): Observable<StockTrupan[]> {
    return this.http.get<StockTrupan[]>(`${this.baseUrl}/stockTrupans`);
  }

  getStockTrupan(id: number): Observable<StockTrupan> {
    return this.http.get<StockTrupan>(`${this.baseUrl}/stockTrupans/${id}`);
  }

  createStockTrupan(stock: StockTrupan): Observable<StockTrupan> {
    return this.http.post<StockTrupan>(`${this.baseUrl}/stockTrupans`, stock);
  }

  updateStockTrupan(id: number, stock: StockTrupan): Observable<StockTrupan> {
    return this.http.put<StockTrupan>(`${this.baseUrl}/stockTrupans/${id}`, stock);
  }

  deleteStockTrupan(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/stockTrupans/${id}`);
  }

  getStockTrupanPorTrupan(id: number): Observable<StockTrupan[]> {
    return this.http.get<StockTrupan[]>(`${this.baseUrl}/stockTrupans/porTrupan/${id}`);
  }

  // Stock Vidrio
  getAllStockVidrio(): Observable<StockVidrio[]> {
    return this.http.get<StockVidrio[]>(`${this.baseUrl}/stockVidrios`);
  }

  getStockVidrio(id: number): Observable<StockVidrio> {
    return this.http.get<StockVidrio>(`${this.baseUrl}/stockVidrio/${id}`);
  }

  createStockVidrio(stock: StockVidrio): Observable<StockVidrio> {
    return this.http.post<StockVidrio>(`${this.baseUrl}/stockVidrio`, stock);
  }

  updateStockVidrio(id: number, stock: StockVidrio): Observable<StockVidrio> {
    return this.http.put<StockVidrio>(`${this.baseUrl}/stockVidrio/${id}`, stock);
  }

  deleteStockVidrio(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/stockVidrio/${id}`);
  }

  getStockVidriosPorVidrio(id: number): Observable<StockVidrio[]> {
    return this.http.get<StockVidrio[]>(`${this.baseUrl}/stockVidrios/porVidrio/${id}`);
  }

  // Stock Contorno
  getAllStockContorno(): Observable<StockContorno[]> {
    return this.http.get<StockContorno[]>(`${this.baseUrl}/stockContornos`);
  }

  getStockContorno(id: number): Observable<StockContorno> {
    return this.http.get<StockContorno>(`${this.baseUrl}/stockContorno/${id}`);
  }

  createStockContorno(stock: StockContorno): Observable<StockContorno> {
    return this.http.post<StockContorno>(`${this.baseUrl}/stockContorno`, stock);
  }

  updateStockContorno(id: number, stock: StockContorno): Observable<StockContorno> {
    return this.http.put<StockContorno>(`${this.baseUrl}/stockContorno/${id}`, stock);
  }

  deleteStockContorno(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/stockContorno/${id}`);
  }

  getStockContornoPorContorno(id: number): Observable<StockContorno[]> {
    return this.http.get<StockContorno[]>(`${this.baseUrl}/stockContorno/porContorno/${id}`);
  }
}