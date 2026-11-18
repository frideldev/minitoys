import { Injectable, inject } from '@angular/core';
import { signalSlice } from 'ngxtension/signal-slice';
import { Sucursal } from '../interfaces/sucursal.interface';
import { SucursalesService } from './sucursales.service';
import { Subject, catchError, map, of, switchMap, tap } from 'rxjs';

interface State {
  sucursales: Sucursal[];
  selectedSucursal: Sucursal | null;
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class SucursalesStateService {
  private sucursalesService = inject(SucursalesService);
  private createSubject = new Subject<Sucursal>();
  private updateSubject = new Subject<{id: number, sucursal: Sucursal}>();
  private deleteSubject = new Subject<number>();
  private refreshSubject = new Subject<void>();

  private initialState: State = {
    sucursales: [],
    selectedSucursal: null,
    status: 'idle',
    error: null
  };

  state = signalSlice({
    initialState: this.initialState,
    sources: [
      // Initial load and refresh trigger
      (state) => this.refreshSubject.pipe(
        switchMap(() => this.sucursalesService.getSucursales().pipe(
          map(sucursales => ({
            sucursales,
            status: 'success' as const,
            error: null
          })),
          catchError(error => of({
            sucursales: [],
            status: 'error' as const,
            error: error.message || 'Error al cargar los clientes'
          }))
        ))
      )
    ],
    actionSources: {
      create: (state) => this.createSubject.pipe(
        switchMap((sucursal) => 
          this.sucursalesService.createSucursal(sucursal).pipe(
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
        switchMap(({id, sucursal}) => 
          this.sucursalesService.updateSucursal(id, sucursal).pipe(
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
          this.sucursalesService.deleteSucursal(id).pipe(
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

  createSucursal(sucursal: Sucursal) {
    this.createSubject.next(sucursal);
  }

  updateSucursal(id: number, sucursal: Sucursal) {
    this.updateSubject.next({id, sucursal});
  }

  deleteSucursal(id: number) {
    this.deleteSubject.next(id);
  }

  refreshData() {
    this.refreshSubject.next();
  }
}