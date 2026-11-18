import { Injectable, inject } from '@angular/core';
import { signalSlice } from 'ngxtension/signal-slice';
import { Subject, catchError, map, of, switchMap, tap, Observable, forkJoin } from 'rxjs';
import { StockService } from './stock.service';
import { StockProducto, StockTrupan, StockVidrio, StockVarilla, StockContorno } from '../interfaces/stock.interface';

interface State {
  stockProductos: StockProducto[];
  stockVarillas: StockVarilla[];
  stockTrupans: StockTrupan[];
  stockVidrios: StockVidrio[];
  stockContornos: StockContorno[];
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class StockStateService {
  private stockService = inject(StockService);
  
  // Subjects for CRUD operations
  private refreshSubject = new Subject<void>();
  
  // Stock Producto subjects
  private createStockProductoSubject = new Subject<StockProducto>();
  private updateStockProductoSubject = new Subject<{id: number, stock: StockProducto}>();
  private deleteStockProductoSubject = new Subject<number>();
  
  // Stock Varilla subjects
  private createStockVarillaSubject = new Subject<StockVarilla>();
  private updateStockVarillaSubject = new Subject<{id: number, stock: StockVarilla}>();
  private deleteStockVarillaSubject = new Subject<number>();
  
  // Stock Trupan subjects
  private createStockTrupanSubject = new Subject<StockTrupan>();
  private updateStockTrupanSubject = new Subject<{id: number, stock: StockTrupan}>();
  private deleteStockTrupanSubject = new Subject<number>();
  
  // Stock Vidrio subjects
  private createStockVidrioSubject = new Subject<StockVidrio>();
  private updateStockVidrioSubject = new Subject<{id: number, stock: StockVidrio}>();
  private deleteStockVidrioSubject = new Subject<number>();

  // Stock Contorno subjects
  private createStockContornoSubject = new Subject<StockContorno>();
  private updateStockContornoSubject = new Subject<{id: number, stock: StockContorno}>();
  private deleteStockContornoSubject = new Subject<number>();

  private initialState: State = {
    stockProductos: [],
    stockVarillas: [],
    stockTrupans: [],
    stockVidrios: [],
    stockContornos: [],
    status: 'idle',
    error: null
  };

  state = signalSlice({
    initialState: this.initialState,
    sources: [
      (): Observable<Partial<State>> => this.refreshSubject.pipe(
        switchMap(() => {
          const productos$ = this.stockService.getAllStockProducto();
          const varillas$ = this.stockService.getAllStockVarilla();
          const trupans$ = this.stockService.getAllStockTrupan();
          const vidrios$ = this.stockService.getAllStockVidrio();
          const contornos$ = this.stockService.getAllStockContorno();

          return forkJoin({
            stockProductos: productos$,
            stockVarillas: varillas$,
            stockTrupans: trupans$,
            stockVidrios: vidrios$,
            stockContornos: contornos$
          }).pipe(
            map(response => ({
              ...response,
              status: 'success' as const,
              error: null
            })),
            catchError(error => of({
              stockProductos: [],
              stockVarillas: [],
              stockTrupans: [],
              stockVidrios: [],
              stockContornos: [],
              status: 'error' as const,
              error: error.message || 'Error al cargar el stock'
            }))
          );
        })
      )
    ],
    actionSources: {
      // Stock Producto actions
      createStockProducto: () => this.createStockProductoSubject.pipe(
        switchMap((stock) => 
          this.stockService.createStockProducto(stock).pipe(
            tap(() => this.refreshData()),
            map(() => ({
              status: 'success' as const,
              error: null
            })),
            catchError(error => of({
              status: 'error' as const,
              error: error.message || 'Error al crear el stock del producto'
            }))
          )
        )
      ),
      updateStockProducto: () => this.updateStockProductoSubject.pipe(
        switchMap(({id, stock}) => 
          this.stockService.updateStockProducto(id, stock).pipe(
            tap(() => this.refreshData()),
            map(() => ({
              status: 'success' as const,
              error: null
            })),
            catchError(error => of({
              status: 'error' as const,
              error: error.message || 'Error al actualizar el stock del producto'
            }))
          )
        )
      ),
      deleteStockProducto: () => this.deleteStockProductoSubject.pipe(
        switchMap((id) => 
          this.stockService.deleteStockProducto(id).pipe(
            tap(() => this.refreshData()),
            map(() => ({
              status: 'success' as const,
              error: null
            })),
            catchError(error => of({
              status: 'error' as const,
              error: error.message || 'Error al eliminar el stock del producto'
            }))
          )
        )
      ),

      // Stock Varilla actions
      createStockVarilla: () => this.createStockVarillaSubject.pipe(
        switchMap((stock) => 
          this.stockService.createStockVarilla(stock).pipe(
            tap(() => this.refreshData()),
            map(() => ({
              status: 'success' as const,
              error: null
            })),
            catchError(error => of({
              status: 'error' as const,
              error: error.message || 'Error al crear el stock de la varilla'
            }))
          )
        )
      ),
      updateStockVarilla: () => this.updateStockVarillaSubject.pipe(
        switchMap(({id, stock}) => 
          this.stockService.updateStockVarilla(id, stock).pipe(
            tap(() => this.refreshData()),
            map(() => ({
              status: 'success' as const,
              error: null
            })),
            catchError(error => of({
              status: 'error' as const,
              error: error.message || 'Error al actualizar el stock de la varilla'
            }))
          )
        )
      ),
      deleteStockVarilla: () => this.deleteStockVarillaSubject.pipe(
        switchMap((id) => 
          this.stockService.deleteStockVarilla(id).pipe(
            tap(() => this.refreshData()),
            map(() => ({
              status: 'success' as const,
              error: null
            })),
            catchError(error => of({
              status: 'error' as const,
              error: error.message || 'Error al eliminar el stock de la varilla'
            }))
          )
        )
      ),

      // Stock Trupan actions
      createStockTrupan: () => this.createStockTrupanSubject.pipe(
        switchMap((stock) => 
          this.stockService.createStockTrupan(stock).pipe(
            tap(() => this.refreshData()),
            map(() => ({
              status: 'success' as const,
              error: null
            })),
            catchError(error => of({
              status: 'error' as const,
              error: error.message || 'Error al crear el stock del trupan'
            }))
          )
        )
      ),
      updateStockTrupan: () => this.updateStockTrupanSubject.pipe(
        switchMap(({id, stock}) => 
          this.stockService.updateStockTrupan(id, stock).pipe(
            tap(() => this.refreshData()),
            map(() => ({
              status: 'success' as const,
              error: null
            })),
            catchError(error => of({
              status: 'error' as const,
              error: error.message || 'Error al actualizar el stock del trupan'
            }))
          )
        )
      ),
      deleteStockTrupan: () => this.deleteStockTrupanSubject.pipe(
        switchMap((id) => 
          this.stockService.deleteStockTrupan(id).pipe(
            tap(() => this.refreshData()),
            map(() => ({
              status: 'success' as const,
              error: null
            })),
            catchError(error => of({
              status: 'error' as const,
              error: error.message || 'Error al eliminar el stock del trupan'
            }))
          )
        )
      ),

      // Stock Vidrio actions
      createStockVidrio: () => this.createStockVidrioSubject.pipe(
        switchMap((stock) => 
          this.stockService.createStockVidrio(stock).pipe(
            tap(() => this.refreshData()),
            map(() => ({
              status: 'success' as const,
              error: null
            })),
            catchError(error => of({
              status: 'error' as const,
              error: error.message || 'Error al crear el stock del vidrio'
            }))
          )
        )
      ),
      updateStockVidrio: () => this.updateStockVidrioSubject.pipe(
        switchMap(({id, stock}) => 
          this.stockService.updateStockVidrio(id, stock).pipe(
            tap(() => this.refreshData()),
            map(() => ({
              status: 'success' as const,
              error: null
            })),
            catchError(error => of({
              status: 'error' as const,
              error: error.message || 'Error al actualizar el stock del vidrio'
            }))
          )
        )
      ),
      deleteStockVidrio: () => this.deleteStockVidrioSubject.pipe(
        switchMap((id) => 
          this.stockService.deleteStockVidrio(id).pipe(
            tap(() => this.refreshData()),
            map(() => ({
              status: 'success' as const,
              error: null
            })),
            catchError(error => of({
              status: 'error' as const,
              error: error.message || 'Error al eliminar el stock del vidrio'
            }))
          )
        )
      ),

      // Stock Contorno actions
      createStockContorno: () => this.createStockContornoSubject.pipe(
        switchMap((stock) => 
          this.stockService.createStockContorno(stock).pipe(
            tap(() => this.refreshData()),
            map(() => ({
              status: 'success' as const,
              error: null
            })),
            catchError(error => of({
              status: 'error' as const,
              error: error.message || 'Error al crear el stock del contorno'
            }))
          )
        )
      ),
      updateStockContorno: () => this.updateStockContornoSubject.pipe(
        switchMap(({id, stock}) => 
          this.stockService.updateStockContorno(id, stock).pipe(
            tap(() => this.refreshData()),
            map(() => ({
              status: 'success' as const,
              error: null
            })),
            catchError(error => of({
              status: 'error' as const,
              error: error.message || 'Error al actualizar el stock del contorno'
            }))
          )
        )
      ),
      deleteStockContorno: () => this.deleteStockContornoSubject.pipe(
        switchMap((id) => 
          this.stockService.deleteStockContorno(id).pipe(
            tap(() => this.refreshData()),
            map(() => ({
              status: 'success' as const,
              error: null
            })),
            catchError(error => of({
              status: 'error' as const,
              error: error.message || 'Error al eliminar el stock del contorno'
            }))
          )
        )
      ),
    }
  });

  // Public methods to trigger actions
  refreshData() {
    this.refreshSubject.next();
  }

  // Stock Producto methods
  createStockProducto(stock: StockProducto) {
    this.createStockProductoSubject.next(stock);
  }

  updateStockProducto(id: number, stock: StockProducto) {
    this.updateStockProductoSubject.next({ id, stock });
  }

  deleteStockProducto(id: number) {
    this.deleteStockProductoSubject.next(id);
  }

  // Public methods for Varilla
  createStockVarilla(stock: StockVarilla) {
    this.createStockVarillaSubject.next(stock);
  }

  updateStockVarilla(id: number, stock: StockVarilla) {
    this.updateStockVarillaSubject.next({ id, stock });
  }

  deleteStockVarilla(id: number) {
    this.deleteStockVarillaSubject.next(id);
  }

  // Public methods for Trupan
  createStockTrupan(stock: StockTrupan) {
    this.createStockTrupanSubject.next(stock);
  }

  updateStockTrupan(id: number, stock: StockTrupan) {
    this.updateStockTrupanSubject.next({ id, stock });
  }

  deleteStockTrupan(id: number) {
    this.deleteStockTrupanSubject.next(id);
  }

  // Public methods for Vidrio
  createStockVidrio(stock: StockVidrio) {
    this.createStockVidrioSubject.next(stock);
  }

  updateStockVidrio(id: number, stock: StockVidrio) {
    this.updateStockVidrioSubject.next({ id, stock });
  }

  deleteStockVidrio(id: number) {
    this.deleteStockVidrioSubject.next(id);
  }

  // Public methods for Contorno
  createStockContorno(stock: StockContorno) {
    this.createStockContornoSubject.next(stock);
  }

  updateStockContorno(id: number, stock: StockContorno) {
    this.updateStockContornoSubject.next({ id, stock });
  }

  deleteStockContorno(id: number) {
    this.deleteStockContornoSubject.next(id);
  }
}