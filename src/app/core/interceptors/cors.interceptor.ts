import { HttpInterceptorFn } from '@angular/common/http';

export const corsInterceptor: HttpInterceptorFn = (req, next) => {
  const headers = req.body instanceof FormData
    ? req.headers.delete('Content-Type')
    : req.headers.set('Content-Type', 'application/json');

  const modifiedReq = req.clone({
    headers: headers
      .set('Accept', 'application/json')
      .set('X-Requested-With', 'XMLHttpRequest')
    // withCredentials: true // Deshabilitado porque el backend usa Bearer Token y tiene CORS set a '*'
  });
  
  return next(modifiedReq);
};