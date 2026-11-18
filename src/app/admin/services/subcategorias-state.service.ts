import { Injectable, inject } from '@angular/core';
import { signalSlice } from 'ngxtension/signal-slice';
import { SubCategoria } from '../interfaces/subcategoria.interface';
import { SubCategoriasService } from './subcategorias.service';
import { Subject, catchError, map, of, switchMap, tap } from 'rxjs';

interface State {
  categorias: SubCategoria[];
  selectedCategoria: SubCategoria | null;
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class SubCategoriasStateService {
  private categoriasService = inject(SubCategoriasService);
  private createSubject = new Subject<SubCategoria>();
  private updateSubject = new Subject<{id: number, categoria: SubCategoria}>();
  private deleteSubject = new Subject<number>();
  private refreshSubject = new Subject<void>();

  private initialState: State = {
    categorias: [],
    selectedCategoria: null,
    status: 'idle',
    error: null
  };

  state = signalSlice({
    initialState: this.initialState,
    sources: [
      // Initial load and refresh trigger
      (state) => this.refreshSubject.pipe(
        switchMap(() => this.categoriasService.getSubCategorias().pipe(
          map(categorias => ({
            categorias,
            status: 'success' as const,
            error: null
          })),
          catchError(error => of({
            categorias: [],
            status: 'error' as const,
            error: error.message || 'Error al cargar los clientes'
          }))
        ))
      )
    ],
    actionSources: {
      create: (state) => this.createSubject.pipe(
        switchMap((categoria) => 
          this.categoriasService.createSubCategoria(categoria).pipe(
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
          this.categoriasService.updateSubCategoria(id, categoria).pipe(
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
          this.categoriasService.deleteSubCategoria(id).pipe(
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

  createSubCategoria(categoria: SubCategoria) {
    this.createSubject.next(categoria);
  }

  updateSubCategoria(id: number, categoria: SubCategoria) {
    this.updateSubject.next({id, categoria});
  }

  deleteSubCategoria(id: number) {
    this.deleteSubject.next(id);
  }

  refreshData() {
    this.refreshSubject.next();
  }
}