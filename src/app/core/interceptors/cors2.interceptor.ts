import { HttpInterceptorFn } from '@angular/common/http';

export const corsInterceptor: HttpInterceptorFn = (req, next) => {
  const modifiedReq = req.clone({
    setHeaders: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    }
    // withCredentials: true // Deshabilitado porque el backend usa Bearer Token y tiene CORS set a '*'
  });
  
  return next(modifiedReq);
};