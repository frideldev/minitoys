import { Injectable, inject } from '@angular/core';
import { signalSlice } from 'ngxtension/signal-slice';
import { Cliente } from '../interfaces/cliente.interface';
import { ClientesService } from './clientes.service';
import { Subject, catchError, map, of, switchMap, tap } from 'rxjs';

interface State {
  clientes: Cliente[];
  selectedCliente: Cliente | null;
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class ClientesStateService {
  private clientesService = inject(ClientesService);
  private createSubject = new Subject<Cliente>();
  private updateSubject = new Subject<{id: number, cliente: Cliente}>();
  private deleteSubject = new Subject<number>();
  private refreshSubject = new Subject<void>();
  private searchSubject = new Subject<string>();

  private initialState: State = {
    clientes: [],
    selectedCliente: null,
    status: 'idle',
    error: null
  };

  state = signalSlice({
    initialState: this.initialState,
    sources: [
      // Initial load and refresh trigger
      (state) => this.refreshSubject.pipe(
        switchMap(() => this.clientesService.getClientes().pipe(
          map(clientes => ({
            clientes,
            status: 'success' as const,
            error: null
          })),
          catchError(error => of({
            clientes: [],
            status: 'error' as const,
            error: error.message || 'Error al cargar los clientes'
          }))
        ))
      ),
      () => this.searchSubject.pipe(
        switchMap((searchTerm) => this.clientesService.searchClientes(searchTerm).pipe(
          map(clientes => ({
            clientes,
            status: 'success' as const,
            error: null
          })),
          catchError(error => of({
            clientes: [],
            status: 'error' as const,
            error: error.message || 'Error al buscar clientes'
          }))
        ))
      )
    ],
    actionSources: {
      create: (state) => this.createSubject.pipe(
        switchMap((cliente) => 
          this.clientesService.createCliente(cliente).pipe(
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
        switchMap(({id, cliente}) => 
          this.clientesService.updateCliente(id, cliente).pipe(
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
          this.clientesService.deleteCliente(id).pipe(
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

  createCliente(cliente: Cliente) {
    this.createSubject.next(cliente);
  }

  updateCliente(id: number, cliente: Cliente) {
    this.updateSubject.next({id, cliente});
  }

  deleteCliente(id: number) {
    this.deleteSubject.next(id);
  }

  refreshData() {
    this.refreshSubject.next();
  }

  searchClientes(searchTerm: string) {
    if (searchTerm.length >= 3) {
      this.searchSubject.next(searchTerm);
    } else if (searchTerm.length === 0) {
      this.refreshData();
    }
  }
}