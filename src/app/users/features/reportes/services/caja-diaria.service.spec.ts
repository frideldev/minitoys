import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CajaDiariaService, VentasDelDiaResponse, ResumenCaja, CajasResponse } from './caja-diaria.service';
import { AuthStateService } from '../../../../auth/services/auth-state.service';
import { User } from '../../../../auth/interfaces/user.interface';
import { environment } from '../../../../../environments/environment';

describe('CajaDiariaService', () => {
  let service: CajaDiariaService;
  let httpMock: HttpTestingController;
  let authServiceMock: jasmine.SpyObj<AuthStateService>;

  const mockUser: User = { 
    id: 1, 
    name: 'Test User', 
    username: 'testuser',
    email: 'test@example.com',
    id_sucursal: 1,
    id_rol: 1,
    token: 'mock-token',
    token_type: 'Bearer'
  };

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthStateService', ['getCurrentUser', 'handleAuthError']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        CajaDiariaService,
        { provide: AuthStateService, useValue: authSpy }
      ]
    });

    service = TestBed.inject(CajaDiariaService);
    httpMock = TestBed.inject(HttpTestingController);
    authServiceMock = TestBed.inject(AuthStateService) as jasmine.SpyObj<AuthStateService>;

    // Configure default mock return values
    authServiceMock.getCurrentUser.and.returnValue(mockUser);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getVentasDelDia', () => {
    it('should fetch ventas del dia and check caja cerrada', () => {
      const fecha = '03-10-25';
      const mockVentasResponse = {
        message: 'success',
        ventas: [
          {
            id: 1,
            precioTotal: 100,
            saldo: 50,
            recogido: true,
            fecha: '2025-10-03',
            cliente: { nombre: 'Juan', apellido: 'Perez' },
            detalle_venta_productos: [{ id: 1, cantidad: 2 }],
            detalle_venta_personalizadas: []
          }
        ]
      };

      const mockCajasResponse: CajasResponse = {
        cajas: [],
        paginacion: {
          pagina_actual: 1,
          total_paginas: 1,
          items_por_pagina: 10,
          total_items: 0
        }
      };

      service.getVentasDelDia(fecha).subscribe(response => {
        expect(response.fecha_consultada).toBe(fecha);
        expect(response.ventas.length).toBe(1);
        expect(response.caja_cerrada).toBe(false);
        expect(response.ventas[0].cliente).toBe('Juan Perez');
        expect(response.ventas[0].estado).toBe('completado');
      });

      // Expect two HTTP calls: ventas and cajas
      const ventasReq = httpMock.expectOne(req => 
        req.url.includes('/ventaProductoMarco') && 
        req.params.get('fecha_desde') === '2025-10-03'
      );
      expect(ventasReq.request.method).toBe('GET');
      ventasReq.flush(mockVentasResponse);

      const cajasReq = httpMock.expectOne(req => req.url.includes('/cajas'));
      expect(cajasReq.request.method).toBe('GET');
      cajasReq.flush(mockCajasResponse);
    });

    it('should detect caja cerrada when exists', () => {
      const fecha = '03-10-25';
      const mockVentasResponse = { message: 'success', ventas: [] };
      
      const mockCajasResponse: CajasResponse = {
        cajas: [
          {
            id: 1,
            fecha: '2025-10-03', // Fecha que coincide
            total: 500,
            ventas: 5,
            detalle: { '1': '300', '2': '200' },
            id_usuario: 1,
            created_at: '2025-10-03T10:00:00Z',
            updated_at: '2025-10-03T10:00:00Z'
          }
        ],
        paginacion: {
          pagina_actual: 1,
          total_paginas: 1,
          items_por_pagina: 10,
          total_items: 1
        }
      };

      service.getVentasDelDia(fecha).subscribe(response => {
        expect(response.caja_cerrada).toBe(true);
        expect(response.ventas.length).toBe(0); // Ventas vacías cuando está cerrada
        expect(response.mensaje_cierre).toContain('ya fue cerrada');
      });

      const ventasReq = httpMock.expectOne(req => req.url.includes('/ventaProductoMarco'));
      ventasReq.flush(mockVentasResponse);

      const cajasReq = httpMock.expectOne(req => req.url.includes('/cajas'));
      cajasReq.flush(mockCajasResponse);
    });

    it('should handle error gracefully', () => {
      const fecha = '03-10-25';

      service.getVentasDelDia(fecha).subscribe(response => {
        expect(response.fecha_consultada).toBe(fecha);
        expect(response.ventas.length).toBe(0);
        expect(response.caja_cerrada).toBe(false);
      });

      // Con combineLatest, ambas llamadas se hacen simultáneamente
      const cajasReq = httpMock.expectOne(req => req.url.includes('/cajas'));
      cajasReq.flush([]);
      
      const ventasReq = httpMock.expectOne(req => req.url.includes('/ventaProductoMarco'));
      ventasReq.error(new ErrorEvent('Network error'));
    });

    it('should throw error when user not authenticated', () => {
      authServiceMock.getCurrentUser.and.returnValue(null);

      expect(() => {
        service.getVentasDelDia('03-10-25');
      }).toThrowError('Usuario no autenticado');
    });
  });

  describe('realizarCierreCaja', () => {
    it('should perform caja closure', () => {
      const mockResumen: ResumenCaja = {
        fechaCierre: '2025-10-03',
        totalVentas: 1000,
        totalEfectivo: 600,
        totalTarjeta: 400,
        totalTransferencia: 0,
        numeroVentas: 10,
        ventasPendientes: 2
      };

      service.realizarCierreCaja().subscribe(response => {
        expect(response).toEqual(mockResumen);
      });

      const req = httpMock.expectOne(`${environment.API_URL}/caja`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body.id_usuario).toBe(mockUser.id);
      req.flush(mockResumen);
    });

    it('should throw error when user not authenticated', () => {
      authServiceMock.getCurrentUser.and.returnValue(null);

      expect(() => {
        service.realizarCierreCaja();
      }).toThrow();
    });
  });

  describe('getReciboHtml', () => {
    it('should fetch recibo HTML', () => {
      const ventaId = 123;
      const mockHtml = '<html><body>Recibo de venta</body></html>';

      service.getReciboHtml(ventaId).subscribe(html => {
        expect(html).toBe(mockHtml);
      });

      const req = httpMock.expectOne(r => r.url.includes(`/recibo/html/${ventaId}`));
      expect(req.request.method).toBe('GET');
      req.flush(mockHtml);
    });

    it('should handle recibo error gracefully', () => {
      const ventaId = 456;
      // The service catches errors and returns a fallback string via catchError
      service.getReciboHtml(ventaId).subscribe({
        next: (html) => {
          expect(html).toContain('Error');
        },
        error: () => fail('Service should have handled the error gracefully')
      });

      const req = httpMock.expectOne(r => r.url.includes(`/recibo/html/${ventaId}`));
      req.flush('Recibo no encontrado', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('getAllCajas', () => {
    it('should fetch all cajas with pagination', () => {
      const mockResponse = [
        {
          id: 1,
          fecha: '2025-10-01',
          total: 500,
          ventas: 5,
          detalle: { '1': '300', '2': '200' },
          id_usuario: 1,
          created_at: '2025-10-01T10:00:00Z',
          updated_at: '2025-10-01T10:00:00Z'
        },
        {
          id: 2,
          fecha: '2025-10-02',
          total: 750,
          ventas: 8,
          detalle: { '1': '450', '2': '300' },
          id_usuario: 1,
          created_at: '2025-10-02T10:00:00Z',
          updated_at: '2025-10-02T10:00:00Z'
        }
      ];

      service.getAllCajas(1, 10).subscribe(response => {
        expect(response.cajas?.length).toBe(2);
        expect(response.paginacion?.pagina_actual).toBe(1);
        expect(response.paginacion?.total_items).toBe(2);
      });

      const req = httpMock.expectOne(req => 
        req.url.includes('/cajas') && 
        req.params.get('page') === '1' &&
        req.params.get('per_page') === '10'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle cajas error gracefully', () => {
      service.getAllCajas().subscribe(response => {
        expect(response.cajas?.length).toBe(0);
        expect(response.paginacion?.total_items).toBe(0);
      });

      const req = httpMock.expectOne(req => req.url.includes('/cajas'));
      req.error(new ErrorEvent('Network error'));
    });
  });

  describe('convertirFechaParaAPI', () => {
    it('should convert DD-MM-YY to YYYY-MM-DD', () => {
      // Acceder al método privado a través de any para testing
      const fechaConvertida = (service as any).convertirFechaParaAPI('03-10-25');
      expect(fechaConvertida).toBe('2025-10-03');
    });

    it('should handle DD-MM-YYYY format', () => {
      const fechaConvertida = (service as any).convertirFechaParaAPI('03-10-2025');
      expect(fechaConvertida).toBe('2025-10-03');
    });
  });

  describe('convertirVentaADetallada', () => {
    it('should convert venta to detallada format', () => {
      // API returns prices multiplied by 100; service divides by 100 via PriceUtils.fromApi
      const mockVenta = {
        id: 1,
        precioTotal: 15000,  // 150.00 Bs × 100
        saldo: 7500,          //  75.00 Bs × 100
        recogido: false,
        fecha: '2025-10-03T14:30:00Z',
        cliente: { nombre: 'Maria', apellido: 'Garcia' },
        detalle_venta_productos: [{ id: 1, cantidad: 1 }, { id: 2, cantidad: 2 }],
        detalle_venta_personalizadas: []
      };

      const resultado = (service as any).convertirVentaADetallada(mockVenta);

      expect(resultado.id).toBe(1);
      expect(resultado.cliente).toBe('Maria Garcia');
      expect(resultado.productos).toBe('2 producto(s)');
      expect(resultado.estado).toBe('pendiente'); // recogido = false
      expect(resultado.total).toBe(150);
      expect(resultado.hora).toMatch(/\d{2}:\d{2}/); // Formato HH:MM
    });

    it('should handle venta completada', () => {
      const mockVenta = {
        id: 2,
        precioTotal: 200,
        saldo: 200,
        recogido: true, // ✅ Completada
        fecha: '2025-10-03T16:45:00Z',
        cliente: { nombre: 'Pedro', apellido: 'Lopez' },
        detalle_venta_productos: [],
        detalle_venta_personalizadas: [{ id: 1 }]
      };

      const resultado = (service as any).convertirVentaADetallada(mockVenta);

      expect(resultado.estado).toBe('completado'); // ✅ recogido = true
      expect(resultado.productos).toBe('1 marco(s) personalizado(s)');
    });

    it('should handle mixed products', () => {
      const mockVenta = {
        id: 3,
        precioTotal: 300,
        saldo: 150,
        recogido: false,
        fecha: '2025-10-03T12:00:00Z',
        cliente: { nombre: 'Ana', apellido: 'Martinez' },
        detalle_venta_productos: [{ id: 1, cantidad: 1 }],
        detalle_venta_personalizadas: [{ id: 1 }, { id: 2 }]
      };

      const resultado = (service as any).convertirVentaADetallada(mockVenta);

      expect(resultado.productos).toBe('1 producto(s), 2 marco(s)');
    });
  });

  describe('verificarCajaCerrada', () => {
    it('should detect caja cerrada for exact date match', () => {
      const cajasResponse: CajasResponse = {
        cajas: [
          {
            id: 1,
            fecha: '2025-10-03',
            total: 500,
            ventas: 5,
            detalle: {},
            id_usuario: 1,
            created_at: '2025-10-03T10:00:00Z',
            updated_at: '2025-10-03T10:00:00Z'
          }
        ]
      };

      const resultado = (service as any).verificarCajaCerrada('2025-10-03', cajasResponse);
      expect(resultado).toBe(true);
    });

    it('should return false when no matching date', () => {
      const cajasResponse: CajasResponse = {
        cajas: [
          {
            id: 1,
            fecha: '2025-10-02', // Fecha diferente
            total: 500,
            ventas: 5,
            detalle: {},
            id_usuario: 1,
            created_at: '2025-10-02T10:00:00Z',
            updated_at: '2025-10-02T10:00:00Z'
          }
        ]
      };

      const resultado = (service as any).verificarCajaCerrada('2025-10-03', cajasResponse);
      expect(resultado).toBe(false);
    });

    it('should handle empty cajas array', () => {
      const cajasResponse: CajasResponse = { cajas: [] };

      const resultado = (service as any).verificarCajaCerrada('2025-10-03', cajasResponse);
      expect(resultado).toBe(false);
    });
  });
});