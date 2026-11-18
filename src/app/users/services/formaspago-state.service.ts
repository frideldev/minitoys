import { Injectable, inject } from '@angular/core';
import { signalSlice } from 'ngxtension/signal-slice';
import { FormaPago } from '../interfaces/formapago.interface';
import { FormasPagoService } from './formaspago.service';
import { Subject, catchError, map, of, switchMap, tap } from 'rxjs';

interface State {
  formasPago: FormaPago[];
  selectedFormaPago: FormaPago | null;
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class FormasPagoStateService {
  private formasPagoService = inject(FormasPagoService);
  private createSubject = new Subject<FormaPago>();
  private updateSubject = new Subject<{id: number, formaPago: FormaPago}>();
  private deleteSubject = new Subject<number>();
  private refreshSubject = new Subject<void>();
  private searchSubject = new Subject<string>();

  private initialState: State = {
    formasPago: [],
    selectedFormaPago: null,
    status: 'idle',
    error: null
  };

  state = signalSlice({
    initialState: this.initialState,
    sources: [
      // Initial load and refresh trigger
      (state) => this.refreshSubject.pipe(
        switchMap(() => this.formasPagoService.getFormasPago().pipe(
          map(formasPago => ({
            formasPago,
            status: 'success' as const,
            error: null
          })),
          catchError(error => of({
            formasPago: [],
            status: 'error' as const,
            error: error.message || 'Error al cargar las formas de pago'
          }))
        ))
      ),
      () => this.searchSubject.pipe(
        switchMap((searchTerm) => this.formasPagoService.searchFormasPago(searchTerm).pipe(
          map(formasPago => ({
            formasPago,
            status: 'success' as const,
            error: null
          })),
          catchError(error => of({
            formasPago: [],
            status: 'error' as const,
            error: error.message || 'Error al buscar formas de pago'
          }))
        ))
      )
    ],
    actionSources: {
      create: (state) => this.createSubject.pipe(
        switchMap((formaPago) => 
          this.formasPagoService.createFormaPago(formaPago).pipe(
            tap(() => this.refreshData()),
            map(() => ({
              status: 'success' as const,
              error: null
            })),
            catchError(error => of({
              status: 'error' as const,
              error: error.message || 'Error al crear la forma de pago'
            }))
          )
        )
      ),
      update: (state) => this.updateSubject.pipe(
        switchMap(({id, formaPago}) => 
          this.formasPagoService.updateFormaPago(id, formaPago).pipe(
            tap(() => this.refreshData()),
            map(() => ({
              status: 'success' as const,
              error: null
            })),
            catchError(error => of({
              status: 'error' as const,
              error: error.message || 'Error al actualizar la forma de pago'
            }))
          )
        )
      ),
      delete: (state) => this.deleteSubject.pipe(
        switchMap((id) => 
          this.formasPagoService.deleteFormaPago(id).pipe(
            tap(() => this.refreshData()),
            map(() => ({
              status: 'success' as const,
              error: null
            })),
            catchError(error => of({
              status: 'error' as const,
              error: error.message || 'Error al eliminar la forma de pago'
            }))
          )
        )
      )
    }
  });

  createFormaPago(formaPago: FormaPago) {
    this.createSubject.next(formaPago);
  }

  updateFormaPago(id: number, formaPago: FormaPago) {
    this.updateSubject.next({id, formaPago});
  }

  deleteFormaPago(id: number) {
    this.deleteSubject.next(id);
  }

  refreshData() {
    this.refreshSubject.next();
  }

  searchFormasPago(searchTerm: string) {
    if (searchTerm.length >= 3) {
      this.searchSubject.next(searchTerm);
    } else if (searchTerm.length === 0) {
      this.refreshData();
    }
  }
}
