import { inject, Injectable } from "@angular/core";
import { User } from "../interfaces/user.interface";
import { signalSlice } from 'ngxtension/signal-slice';
import { AuthService } from "./auth.service";
import { computed, Signal } from '@angular/core';
import { of, Subject } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

interface State {
  user: User | null;
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthStateService {
  private authService = inject(AuthService);
  private router = inject(Router);
  private loginSubject = new Subject<{username: string, password: string}>();
  private initSubject = new Subject<void>();

  private initialState: State = {
    user: null,
    status: 'idle',
    error: null
  };

  state = signalSlice({
    initialState: this.initialState,
    sources: [
      // Initialize from localStorage
      (state) => this.initSubject.pipe(
        map(() => {
          const user = this.authService.getCurrentUser();
          return {
            user,
            status: user ? 'success' as const : 'idle' as const,
            error: null
          };
        })
      ),
      // Login flow
      (state) => this.loginSubject.pipe(
        switchMap(({username, password}) => {
          // Set loading state immediately
          return of({
            user: null,
            status: 'loading' as const,
            error: null
          }).pipe(
            // Chain with the actual login request
            switchMap(() => this.authService.login(username, password).pipe(
              map(user => ({
                user,
                status: 'success' as const,
                error: null
              })),
              catchError(error => of({
                user: null,
                status: 'error' as const,
                error: error.error?.message || error.message || 'Error durante el inicio de sesión'
              }))
            ))
          );
        })
      )
    ],
    actionSources: {
      logout: (state: Signal<State>) => of({
        user: null,
        status: 'idle' as const,
        error: null
      }).pipe(
        tap(() => this.authService.logout())
      )
    }
  });

  constructor() {
    // Initialize state from localStorage on service creation
    this.initializeFromStorage();
  }

  initializeFromStorage() {
    this.initSubject.next();
  }

  login(username: string, password: string) {
    this.loginSubject.next({ username, password });
  }

  logout() {
    this.state.logout();
  }

  getCurrentUser(): User | null {
    return this.state().user;
  }

  /**
   * Valida si el usuario actual es válido y tiene ID
   * Si no es válido, cierra sesión automáticamente
   */
  validateUserAndRedirect(): boolean {
    const currentUser = this.getCurrentUser();
    
    if (!currentUser) {
      console.warn('🔒 No hay usuario autenticado - redirigiendo al login');
      this.forceLogout();
      return false;
    }

    if (!currentUser.id || !Number.isInteger(currentUser.id) || currentUser.id <= 0) {
      console.error('🔒 ID de usuario inválido - redirigiendo al login:', currentUser.id);
      this.forceLogout();
      return false;
    }

    if (!currentUser.token) {
      console.warn('🔒 Token no encontrado - redirigiendo al login');
      this.forceLogout();
      return false;
    }

    return true;
  }

  /**
   * Fuerza el cierre de sesión y redirección al login
   */
  private forceLogout(): void {
    console.log('🚪 Cerrando sesión automáticamente...');
    
    // Limpiar localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Actualizar estado
    this.logout();
    
    // Redirigir al login
    this.router.navigate(['/landing']);
  }

  /**
   * Método público para llamar desde componentes cuando hay errores de autenticación
   */
  handleAuthError(error?: any): void {
    console.error('🔒 Error de autenticación detectado:', error);
    
    // Verificar si es un error 401 (Unauthorized)
    if (error?.status === 401 || error?.error?.message?.includes('token')) {
      console.warn('🔒 Token expirado o inválido - cerrando sesión');
      this.forceLogout();
      return;
    }

    // Validar usuario actual
    if (!this.validateUserAndRedirect()) {
      return;
    }
  }

  getAuthStatus = computed(() => ({
    isAuthenticated: this.state().status === 'success' && !!this.state().user,
    user: this.state().user,
    status: this.state().status,
    error: this.state().error
  }));
}