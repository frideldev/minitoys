import { Injectable, inject } from '@angular/core';
import { signalSlice } from 'ngxtension/signal-slice';
import { Lugar } from '../interfaces/lugar.interface';
import { LugarService } from './lugar.service';
import { Subject, catchError, map, of, switchMap, tap } from 'rxjs';

interface State {
  lugares: Lugar[];
  selectedLugar: Lugar | null;
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class LugarStateService {
  private lugarService = inject(LugarService);
  private createSubject = new Subject<Lugar>();
  private updateSubject = new Subject<{id: number, lugar: Lugar}>();
  private deleteSubject = new Subject<number>();
  private refreshSubject = new Subject<void>();
  private searchSubject = new Subject<string>();

  private initialState: State = {
    lugares: [],
    selectedLugar: null,
    status: 'idle',
    error: null
  };

  state = signalSlice({
    initialState: this.initialState,
    sources: [
      // Initial load and refresh trigger
      (state) => this.refreshSubject.pipe(
        switchMap(() => this.lugarService.getLugares().pipe(
          map(lugares => ({
            lugares,
            status: 'success' as const,
            error: null
          })),
          catchError(error => of({
            lugares: [],
            status: 'error' as const,
            error: error.message || 'Error al cargar los lugares'
          }))
        ))
      ),
      () => this.searchSubject.pipe(
        switchMap((searchTerm) => this.lugarService.searchLugares(searchTerm).pipe(
          map(lugares => ({
            lugares,
            status: 'success' as const,
            error: null
          })),
          catchError(error => of({
            lugares: [],
            status: 'error' as const,
            error: error.message || 'Error al buscar lugares'
          }))
        ))
      )
    ],
    actionSources: {
      create: (state) => this.createSubject.pipe(
        switchMap((lugar) => 
          this.lugarService.createLugar(lugar).pipe(
            tap(() => this.refreshData()),
            map(() => ({
              status: 'success' as const,
              error: null
            })),
            catchError(error => of({
              status: 'error' as const,
              error: error.message || 'Error al crear el lugar'
            }))
          )
        )
      ),
      update: (state) => this.updateSubject.pipe(
        switchMap(({id, lugar}) => 
          this.lugarService.updateLugar(id, lugar).pipe(
            tap(() => this.refreshData()),
            map(() => ({
              status: 'success' as const,
              error: null
            })),
            catchError(error => of({
              status: 'error' as const,
              error: error.message || 'Error al actualizar el lugar'
            }))
          )
        )
      ),
      delete: (state) => this.deleteSubject.pipe(
        switchMap((id) => 
          this.lugarService.deleteLugar(id).pipe(
            tap(() => this.refreshData()),
            map(() => ({
              status: 'success' as const,
              error: null
            })),
            catchError(error => of({
              status: 'error' as const,
              error: error.message || 'Error al eliminar el lugar'
            }))
          )
        )
      )
    }
  });

  createLugar(lugar: Lugar) {
    this.createSubject.next(lugar);
  }

  updateLugar(id: number, lugar: Lugar) {
    this.updateSubject.next({id, lugar});
  }

  deleteLugar(id: number) {
    this.deleteSubject.next(id);
  }

  refreshData() {
    this.refreshSubject.next();
  }

  searchLugares(searchTerm: string) {
    if (searchTerm.length >= 3) {
      this.searchSubject.next(searchTerm);
    } else if (searchTerm.length === 0) {
      this.refreshData();
    }
  }
}