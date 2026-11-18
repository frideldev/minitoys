import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../../auth/services/auth.service';
import { AuthStateService } from '../../auth/services/auth-state.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const authStateService = inject(AuthStateService);
  const token = authService.getToken();

  const authReq = token
    ? req.clone({ headers: req.headers.set('Authorization', `Bearer ${token}`) })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // 401 = token expirado / no válido  |  403 = sin permisos (también puede indicar sesión caída)
      if (error.status === 401 || error.status === 403) {
        authStateService.handleAuthError(error);
      }
      return throwError(() => error);
    })
  );
};
