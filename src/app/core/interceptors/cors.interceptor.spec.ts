import { HttpHeaders, HttpRequest, HttpResponse } from '@angular/common/http';
import { corsInterceptor } from './cors.interceptor';
import { of } from 'rxjs';

describe('corsInterceptor', () => {
  it('leaves Content-Type unset for FormData so the browser can add the multipart boundary', () => {
    const formData = new FormData();
    formData.append('descripcion', 'Muñeca');
    const request = new HttpRequest('POST', '/producto', formData, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    });
    const next = jasmine.createSpy('next').and.returnValue(of(new HttpResponse()));

    corsInterceptor(request, next).subscribe();

    const forwardedRequest = next.calls.mostRecent().args[0];
    expect(forwardedRequest.body).toBe(formData);
    expect(forwardedRequest.headers.has('Content-Type')).toBeFalse();
    expect(forwardedRequest.headers.get('Accept')).toBe('application/json');
  });

  it('keeps JSON Content-Type for non-FormData requests', () => {
    const request = new HttpRequest('POST', '/producto', { descripcion: 'Muñeca' });
    const next = jasmine.createSpy('next').and.returnValue(of(new HttpResponse()));

    corsInterceptor(request, next).subscribe();

    const forwardedRequest = next.calls.mostRecent().args[0];
    expect(forwardedRequest.headers.get('Content-Type')).toBe('application/json');
  });
});
