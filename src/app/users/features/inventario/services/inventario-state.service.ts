import { Injectable, inject } from '@angular/core';
import { signalSlice } from 'ngxtension/signal-slice';
import { Subject, catchError, map, of, switchMap, tap, forkJoin, Observable } from 'rxjs';
import { InventarioService } from './inventario.service';
import { Producto } from '../interfaces/producto.interface';
import { MateriaPrimaVarilla, MateriaPrimaTrupan, MateriaPrimaVidrio, MateriaPrimaContorno } from '../interfaces/materia-prima.interface';
import { TodosInventario,InventarioResponse } from '../interfaces/inventario.interface';
interface State {
  items: TodosInventario[];
  allFilteredItems: TodosInventario[];
  currentPage: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
  selectedTipo: string;
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class InventarioStateService {
  private inventarioService = inject(InventarioService);
  
  // Subjects for CRUD operations
  private createProductoSubject = new Subject<FormData>();
  private createVarillaSubject = new Subject<MateriaPrimaVarilla>();
  private createTrupanSubject = new Subject<MateriaPrimaTrupan>();
  private createVidrioSubject = new Subject<MateriaPrimaVidrio>();
  private refreshSubject = new Subject<void>();
  private tipoSubject = new Subject<string>();
  private searchSubject = new Subject<string>();
  private pageSubject = new Subject<{page: number, perPage: number}>();
  private deleteProductoSubject = new Subject<number>();
  private deleteVarillaSubject = new Subject<number>();
  private deleteTrupanSubject = new Subject<number>();
  private deleteVidrioSubject = new Subject<number>();
  // Add new subjects for update operations
  private updateProductoSubject = new Subject<{id: number, formData: FormData}>();
  private updateVarillaSubject = new Subject<{id: number, data: MateriaPrimaVarilla}>();
  private updateTrupanSubject = new Subject<{id: number, data: MateriaPrimaTrupan}>();
  private updateVidrioSubject = new Subject<{id: number, data: MateriaPrimaVidrio}>();
  // Add new Subject for Contorno operations
  private createContornoSubject = new Subject<MateriaPrimaContorno>();
  private updateContornoSubject = new Subject<{id: number, data: MateriaPrimaContorno}>();
  private deleteContornoSubject = new Subject<number>();
  private initialState: State = {
    items: [],
    allFilteredItems: [],
    currentPage: 1,
    perPage: 10,
    totalItems: 0,
    totalPages: 0,
    selectedTipo: 'producto',
    status: 'idle',
    error: null
  };

  state = signalSlice({
    initialState: this.initialState,
    sources: [
      (): Observable<Partial<State>> => this.refreshSubject.pipe(
        switchMap(() => {
          const selectedTipo = this.state().selectedTipo;
          if (selectedTipo === 'todos') {
            return this.inventarioService.getTodoslosProductos(
              this.state().currentPage,
              this.state().perPage
            ).pipe(
              map((response: InventarioResponse) => ({
                ...this.initialState,
                items: response.data,
                allFilteredItems: [],
                currentPage: response.currentPage,
                totalItems: response.totalItems,
                totalPages: response.totalPages,
                status: 'success' as const,
              }))
            );
          } else {
            return this.inventarioService.getProductosPorTipo(selectedTipo).pipe(
              map((response: InventarioResponse) => {
                const allItems = response.data;
                const perPage = this.state().perPage;
                const totalPages = Math.ceil(allItems.length / perPage);
                const actualPage = Math.min(this.state().currentPage, Math.max(1, totalPages));
                const start = (actualPage - 1) * perPage;
                return {
                  ...this.initialState,
                  items: allItems.slice(start, start + perPage),
                  allFilteredItems: allItems,
                  currentPage: actualPage,
                  totalItems: allItems.length,
                  totalPages,
                  selectedTipo,
                  status: 'success' as const,
                };
              })
            );
          }
        })
      ),
      (): Observable<Partial<State>> => this.searchSubject.pipe(
        switchMap((searchTerm: string): Observable<Partial<State>> => this.inventarioService.getProductosPorTipo('producto').pipe(
          map((response: InventarioResponse): Partial<State> => {
            const term = searchTerm.trim().toLocaleLowerCase();
            const allItems = response.data.filter(item =>
              `${item.codigo} ${item.descripcion}`.toLocaleLowerCase().includes(term)
            );
            const perPage: number = this.initialState.perPage;
            return {
              ...this.initialState,
              items: allItems.slice(0, perPage),
              allFilteredItems: allItems,
              currentPage: 1,
              perPage,
              totalItems: allItems.length,
              totalPages: Math.ceil(allItems.length / perPage),
              selectedTipo: 'producto',
              status: 'success' as const,
              error: null
            };
          }),
          catchError(error => of({
            ...this.initialState,
            status: 'error' as const,
            error: error.message || 'Error al buscar productos'
          }))
        ))
      ),
       // Add pagination source
       (): Observable<Partial<State>> => this.pageSubject.pipe(
        switchMap(({page, perPage}) => {
          const selectedTipo = this.state().selectedTipo;
          if (selectedTipo === 'todos') {
            return this.inventarioService.getTodoslosProductos(page, perPage).pipe(
              map((response: InventarioResponse) => ({
                ...this.state(),
                items: response.data,
                currentPage: page,
                perPage,
                totalItems: response.totalItems,
                totalPages: response.totalPages,
                status: 'success' as const,
              }))
            );
          } else {
            const allItems = this.state().allFilteredItems;
            const start = (page - 1) * perPage;
            return of({
              items: allItems.slice(start, start + perPage),
              currentPage: page,
              perPage,
              status: 'success' as const,
            } as Partial<State>);
          }
        })
      ),
      (): Observable<Partial<State>> => this.tipoSubject.pipe(
        switchMap((tipo) => {
          return (tipo === 'todos' ?
            this.inventarioService.getTodoslosProductos(1, this.state().perPage) :
            this.inventarioService.getProductosPorTipo(tipo)
          ).pipe(
            map((response: InventarioResponse) => {
              if (tipo === 'todos') {
                return {
                  ...this.initialState,
                  items: response.data,
                  allFilteredItems: [],
                  currentPage: response.currentPage,
                  totalItems: response.totalItems,
                  totalPages: response.totalPages,
                  selectedTipo: tipo,
                  status: 'success' as const,
                };
              } else {
                const allItems = response.data;
                const perPage = this.state().perPage;
                const totalPages = Math.ceil(allItems.length / perPage);
                return {
                  ...this.initialState,
                  items: allItems.slice(0, perPage),
                  allFilteredItems: allItems,
                  currentPage: 1,
                  totalItems: allItems.length,
                  totalPages,
                  selectedTipo: tipo,
                  status: 'success' as const,
                };
              }
            }),
            catchError(error => of({
              ...this.initialState,
              selectedTipo: tipo,
              status: 'error' as const,
              error: error.message || `Error al cargar items de tipo ${tipo}`
            }))
          );
        })
      )
    ],
    actionSources: {
      createProducto: () => this.createProductoSubject.pipe(
        switchMap((formData) => 
          this.inventarioService.createProducto(formData).pipe(
            tap(() => this.refreshData()),
            map(() => ({
              status: 'success' as const,
              error: null
            })),
            catchError(error => of({
              status: 'error' as const,
              error: error.message || 'Error al crear el producto'
            }))
          )
        )
      ),
      createVarilla: () => this.createVarillaSubject.pipe(
        switchMap((varilla) => 
          this.inventarioService.createVarilla(varilla).pipe(
            tap(() => this.refreshData()),
            map(() => ({
              status: 'success' as const,
              error: null
            })),
            catchError(error => of({
              status: 'error' as const,
              error: error.message || 'Error al crear la varilla'
            }))
          )
        )
      ),
      createTrupan: () => this.createTrupanSubject.pipe(
        switchMap((trupan) => 
          this.inventarioService.createTrupan(trupan).pipe(
            tap(() => this.refreshData()),
            map(() => ({
              status: 'success' as const,
              error: null
            })),
            catchError(error => of({
              status: 'error' as const,
              error: error.message || 'Error al crear el trupan'
            }))
          )
        )
      ),
      createVidrio: () => this.createVidrioSubject.pipe(
        switchMap((vidrio) => 
          this.inventarioService.createVidrio(vidrio).pipe(
            tap(() => this.refreshData()),
            map(() => ({
              status: 'success' as const,
              error: null
            })),
            catchError(error => of({
              status: 'error' as const,
              error: error.message || 'Error al crear el vidrio'
            }))
          )
        )
      ),
      deleteProducto: () => this.deleteProductoSubject.pipe(
        switchMap((id) => 
          this.inventarioService.deleteProducto(id).pipe(
            tap(() => this.refreshData()),
            map(() => ({
              status: 'success' as const,
              error: null
            })),
            catchError(error => of({
              status: 'error' as const,
              error: error.message || 'Error al eliminar el producto'
            }))
          )
        )
      ),
      deleteVarilla: () => this.deleteVarillaSubject.pipe(
        switchMap((id) => 
          this.inventarioService.deleteVarilla(id).pipe(
            tap(() => this.refreshData()),
            map(() => ({
              status: 'success' as const,
              error: null
            })),
            catchError(error => of({
              status: 'error' as const,
              error: error.message || 'Error al eliminar la varilla'
            }))
          )
        )
      ),
      deleteTrupan: () => this.deleteTrupanSubject.pipe(
        switchMap((id) => 
          this.inventarioService.deleteTrupan(id).pipe(
            tap(() => this.refreshData()),
            map(() => ({
              status: 'success' as const,
              error: null
            })),
            catchError(error => of({
              status: 'error' as const,
              error: error.message || 'Error al eliminar el trupan'
            }))
          )
        )
      ),
      deleteVidrio: () => this.deleteVidrioSubject.pipe(
        switchMap((id) => 
          this.inventarioService.deleteVidrio(id).pipe(
            tap(() => this.refreshData()),
            map(() => ({
              status: 'success' as const,
              error: null
            })),
            catchError(error => of({
              status: 'error' as const,
              error: error.message || 'Error al eliminar el vidrio'
            }))
          )
        )
      ),
      updateProducto: () => this.updateProductoSubject.pipe(
        switchMap(({id, formData}) => 
          this.inventarioService.updateProducto(id, formData).pipe(
            tap(() => this.refreshData()),
            map(() => ({
              status: 'success' as const,
              error: null
            })),
            catchError(error => of({
              status: 'error' as const,
              error: error.message || 'Error al actualizar el producto'
            }))
          )
        )
      ),

      updateVarilla: () => this.updateVarillaSubject.pipe(
        switchMap(({id, data}) => 
          this.inventarioService.updateVarilla(id, data).pipe(
            tap(() => this.refreshData()),
            map(() => ({
              status: 'success' as const,
              error: null
            })),
            catchError(error => of({
              status: 'error' as const,
              error: error.message || 'Error al actualizar la varilla'
            }))
          )
        )
      ),

      updateTrupan: () => this.updateTrupanSubject.pipe(
        switchMap(({id, data}) => 
          this.inventarioService.updateTrupan(id, data).pipe(
            tap(() => this.refreshData()),
            map(() => ({
              status: 'success' as const,
              error: null
            })),
            catchError(error => of({
              status: 'error' as const,
              error: error.message || 'Error al actualizar el trupan'
            }))
          )
        )
      ),

      updateVidrio: () => this.updateVidrioSubject.pipe(
        switchMap(({id, data}) => 
          this.inventarioService.updateVidrio(id, data).pipe(
            tap(() => this.refreshData()),
            map(() => ({
              status: 'success' as const,
              error: null
            })),
            catchError(error => of({
              status: 'error' as const,
              error: error.message || 'Error al actualizar el vidrio'
            }))
          )
        )
      ),
      // Add Contorno action sources
      createContorno: () => this.createContornoSubject.pipe(
        switchMap((contorno) => 
          this.inventarioService.createContorno(contorno).pipe(
            tap(() => this.refreshData()),
            map(() => ({
              status: 'success' as const,
              error: null
            })),
            catchError(error => of({
              status: 'error' as const,
              error: error.message || 'Error al crear el contorno'
            }))
          )
        )
      ),
      updateContorno: () => this.updateContornoSubject.pipe(
        switchMap(({id, data}) => 
          this.inventarioService.updateContorno(id, data).pipe(
            tap(() => this.refreshData()),
            map(() => ({
              status: 'success' as const,
              error: null
            })),
            catchError(error => of({
              status: 'error' as const,
              error: error.message || 'Error al actualizar el contorno'
            }))
          )
        )
      ),
      deleteContorno: () => this.deleteContornoSubject.pipe(
        switchMap((id) => 
          this.inventarioService.deleteContorno(id).pipe(
            tap(() => this.refreshData()),
            map(() => ({
              status: 'success' as const,
              error: null
            })),
            catchError(error => of({
              status: 'error' as const,
              error: error.message || 'Error al eliminar el contorno'
            }))
          )
        )
      ),
    }
  });

  // Add method to change tipo
  filterByTipo(tipo: string) {
    this.tipoSubject.next(tipo);
  }

  // Public methods to trigger actions
  createProducto(formData: FormData) {
    this.createProductoSubject.next(formData);
  }

  createVarilla(varilla: MateriaPrimaVarilla) {
    this.createVarillaSubject.next(varilla);
  }

  createTrupan(trupan: MateriaPrimaTrupan) {
    this.createTrupanSubject.next(trupan);
  }

  createVidrio(vidrio: MateriaPrimaVidrio) {
    this.createVidrioSubject.next(vidrio);
  }

  deleteProducto(id: number) {
    this.deleteProductoSubject.next(id);
  }

  deleteVarilla(id: number) {
    this.deleteVarillaSubject.next(id);
  }

  deleteTrupan(id: number) {
    this.deleteTrupanSubject.next(id);
  }

  deleteVidrio(id: number) {
    this.deleteVidrioSubject.next(id);
  }
  // Add public methods to trigger Contorno actions
  createContorno(contorno: MateriaPrimaContorno) {
    this.createContornoSubject.next(contorno);
  }

  updateContorno(id: number, data: MateriaPrimaContorno) {
    this.updateContornoSubject.next({ id, data });
  }

  deleteContorno(id: number) {
    this.deleteContornoSubject.next(id);
  }

  refreshData() {
    this.refreshSubject.next();
  }
  searchInventario(searchTerm: string) {
    if (searchTerm.trim().length >= 2) {
      this.searchSubject.next(searchTerm);
    } else {
      this.refreshData();
    }
  }
   // Add method to change page
   changePage(page: number, perPage: number = 10) {
    this.pageSubject.next({ page, perPage });
  }

  // Add public methods to trigger updates
  updateProducto(id: number, formData: FormData) {
    this.updateProductoSubject.next({ id, formData });
  }

  updateVarilla(id: number, data: MateriaPrimaVarilla) {
    this.updateVarillaSubject.next({ id, data });
  }

  updateTrupan(id: number, data: MateriaPrimaTrupan) {
    this.updateTrupanSubject.next({ id, data });
  }

  updateVidrio(id: number, data: MateriaPrimaVidrio) {
    this.updateVidrioSubject.next({ id, data });
  }
}