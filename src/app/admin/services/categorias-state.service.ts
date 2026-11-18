import { Injectable, inject } from '@angular/core';
import { signalSlice } from 'ngxtension/signal-slice';
import { Subject, catchError, map, of, switchMap, tap } from 'rxjs';
import { Categoria } from '../interfaces/categoria.interface';
import { CategoriasService } from './categorias.service';

interface State {
  categorias: Categoria[];
  selectedCategoria: Categoria | null;
  selectedTipo: string; // Add this line
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class CategoriasStateService {
  private categoriasService = inject(CategoriasService);
  private createSubject = new Subject<Categoria>();
  private updateSubject = new Subject<{id: number, categoria: Categoria}>();
  private deleteSubject = new Subject<number>();
  private refreshSubject = new Subject<void>();
  private tipoSubject = new Subject<string>(); // Add this line

  private initialState: State = {
    categorias: [],
    selectedCategoria: null,
    selectedTipo: 'todos', // Add this line
    status: 'idle',
    error: null
  };

  state = signalSlice({
    initialState: this.initialState,
    sources: [
      // Initial load and refresh trigger
      () => this.refreshSubject.pipe(
        switchMap(() => this.categoriasService.getCategorias().pipe(
          map(categorias => ({
            ...this.initialState,
            categorias,
            status: 'success' as const,
            error: null
          })),
          catchError(error => of({
            ...this.initialState,
            status: 'error' as const,
            error: error.message
          }))
        ))
      ),
      // Add tipo filter source
      () => this.tipoSubject.pipe(
        switchMap((tipo) => {
          return (tipo === 'todos' ? 
            this.categoriasService.getCategorias() :
            this.categoriasService.getCategoriasporTipo(tipo)
          ).pipe(
            map(categorias => ({
              ...this.initialState,
              categorias,
              selectedTipo: tipo,
              status: 'success' as const,
              error: null
            })),
            catchError(error => of({
              ...this.initialState,
              status: 'error' as const,
              error: error.message
            }))
          );
        })
      )
    ],
    actionSources: {
      create: (state) => this.createSubject.pipe(
        switchMap((categoria) => 
          this.categoriasService.createCategoria(categoria).pipe(
            tap(() => this.refreshData()),
            map(() => ({
              status: 'success' as const,
              error: null
            })),
            catchError(error => of({
              status: 'error' as const,
              error: error.message || 'Error al crear el cliente'
            }))
          )
        )
      ),
      update: (state) => this.updateSubject.pipe(
        switchMap(({id, categoria}) => 
          this.categoriasService.updateCategoria(id, categoria).pipe(
            tap(() => this.refreshData()),
            map(() => ({
              status: 'success' as const,
              error: null
            })),
            catchError(error => of({
              status: 'error' as const,
              error: error.message || 'Error al actualizar el cliente'
            }))
          )
        )
      ),
      delete: (state) => this.deleteSubject.pipe(
        switchMap((id) => 
          this.categoriasService.deleteCategoria(id).pipe(
            tap(() => this.refreshData()),
            map(() => ({
              status: 'success' as const,
              error: null
            })),
            catchError(error => of({
              status: 'error' as const,
              error: error.message || 'Error al eliminar el cliente'
            }))
          )
        )
      )
    }
  });

  // Add filter method
  filterByTipo(tipo: string) {
    this.tipoSubject.next(tipo);
  }

  createCategoria(categoria: Categoria) {
    this.createSubject.next(categoria);
  }

  updateCategoria(id: number, categoria: Categoria) {
    this.updateSubject.next({id, categoria});
  }

  deleteCategoria(id: number) {
    this.deleteSubject.next(id);
  }

  refreshData() {
    this.refreshSubject.next();
  }
}