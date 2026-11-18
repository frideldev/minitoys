import { Injectable, inject } from '@angular/core';
import { signalSlice } from 'ngxtension/signal-slice';
import { Usuario } from '../interfaces/usuario.interface';
import { UsuariosService } from './usuarios.service';
import { Subject, catchError, map, of, switchMap, tap } from 'rxjs';

interface State {
  usuarios: Usuario[];
  selectedUsuario: Usuario | null;
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class UsuariosStateService {
  private usuariosService = inject(UsuariosService);
  private createSubject = new Subject<Usuario>();
  private updateSubject = new Subject<{id: number, usuario: Usuario}>();
  private deleteSubject = new Subject<number>();
  private refreshSubject = new Subject<void>();

  private initialState: State = {
    usuarios: [],
    selectedUsuario: null,
    status: 'idle',
    error: null
  };

  state = signalSlice({
    initialState: this.initialState,
    sources: [
      // Initial load and refresh trigger
      (state) => this.refreshSubject.pipe(
        switchMap(() => this.usuariosService.getUsuarios().pipe(
          map(usuarios => ({
            usuarios,
            status: 'success' as const,
            error: null
          })),
          catchError(error => of({
            usuarios: [],
            status: 'error' as const,
              error: error.error?.message || error.message || 'Error al cargar los usuarios'
          }))
        ))
      )
    ],
    actionSources: {
      create: (state) => this.createSubject.pipe(
        switchMap((usuario) => 
          this.usuariosService.createUsuario(usuario).pipe(
            tap(() => this.refreshData()),
            map(() => ({
              status: 'success' as const,
              error: null
            })),
            catchError(error => of({
              status: 'error' as const,
              error: error.error?.message || error.message || 'Error al crear el usuario'
            }))
          )
        )
      ),
      update: (state) => this.updateSubject.pipe(
        switchMap(({id, usuario}) => 
          this.usuariosService.updateUsuario(id, usuario).pipe(
            tap(() => this.refreshData()),
            map(() => ({
              status: 'success' as const,
              error: null
            })),
            catchError(error => of({
              status: 'error' as const,
              error: error.error?.message || error.message || 'Error al actualizar el usuario'
            }))
          )
        )
      ),
      delete: (state) => this.deleteSubject.pipe(
        switchMap((id) => 
          this.usuariosService.deleteUsuario(id).pipe(
            tap(() => this.refreshData()),
            map(() => ({
              status: 'success' as const,
              error: null
            })),
            catchError(error => of({
              status: 'error' as const,
              error: error.error?.message || error.message || 'Error al eliminar el usuario'
            }))
          )
        )
      )
    }
  });

  createUsuario(usuario: Usuario) {
    this.createSubject.next(usuario);
  }

  updateUsuario(id: number, usuario: Usuario) {
    this.updateSubject.next({id, usuario});
  }

  deleteUsuario(id: number) {
    this.deleteSubject.next(id);
  }

  refreshData() {
    this.refreshSubject.next();
  }
}