import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { CierreCaja, FiltroCierreCaja, ResponseCierreCaja } from '../interfaces/cierre-caja.interface';
import { CajaDiariaService, CajaReal } from '../../../../users/features/reportes/services/caja-diaria.service';
import { PriceUtils } from '../../../utils/price.utils';

@Injectable({
  providedIn: 'root'
})
export class CierreCajaService {
  private cajaDiariaService = inject(CajaDiariaService);

  /**
   * Devuelve TODOS los cierres sin paginar, para detección de meses disponibles y sus años reales.
   * No aplica filtros — sirve sólo para poblar el selector de mes y conocer el año de cada mes.
   */
  getTodosCierresParaDeteccion(): Observable<CierreCaja[]> {
    return this.cajaDiariaService.getAllCajas(1, 1000).pipe(
      map(response => {
        let cajasArray: CajaReal[] = [];
        if (Array.isArray(response)) {
          cajasArray = response as unknown as CajaReal[];
        } else if (response?.cajas && Array.isArray(response.cajas)) {
          cajasArray = response.cajas;
        } else if (response?.data && Array.isArray((response as any).data)) {
          cajasArray = (response as any).data;
        }
        return cajasArray.map((c: CajaReal) => this.convertirCajaRealACierreCaja(c));
      }),
      catchError(() => of([]))
    );
  }

  /**
   * Obtiene los cierres de caja con filtros y paginación.
   * Descarga todos los registros del API y pagina en cliente,
   * para que los filtros de mes/búsqueda no rompan la paginación.
   */
  getCierresCaja(filtros: FiltroCierreCaja, pagina: number = 1): Observable<ResponseCierreCaja> {
    const itemsPorPagina = 5;

    return this.cajaDiariaService.getAllCajas(1, 1000).pipe(
      map(response => this.convertirCajasAResponse(response, filtros, pagina, itemsPorPagina)),
      catchError((error) => {
        console.error('❌ [CierreCaja] Error al obtener cajas:', error);
        return of(this.getResponseVacio());
      })
    );
  }

  /**
   * Genera una respuesta vacía cuando el API falla
   */
  private getResponseVacio(): ResponseCierreCaja {
    return {
      cierres: [],
      paginacion: {
        paginaActual: 1,
        totalPaginas: 0,
        itemsPorPagina: 5,
        totalItems: 0
      }
    };
  }

  /**
   * Obtiene lista de meses disponibles desde el API real
   */
  getMesesDisponibles(): string[] {
    const todosMeses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    return ['Todos', ...todosMeses];
  }

  /**
   * Obtiene el mes actual basado en fecha real (NO hardcodeado)
   */
  getMesActual(): string {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    // Usar la fecha real del sistema
    const fechaActual = new Date();
    const mesActual = fechaActual.getMonth(); // 0-11
    
    return meses[mesActual];
  }

  /**
   * Descargar PDF del cierre de caja usando la fecha real del cierre
   */
  descargarPDF(fechaCierre: string): void {
    // Usar la fecha real del cierre, no la fecha actual del sistema
    console.log('📄 [CierreCaja] Descargando PDF para fecha:', fechaCierre);
    this.cajaDiariaService.descargarPDFDiario(fechaCierre);
  }

  /**
   * Descargar PDF mensual
   */
  descargarPDFMensual(año: number, mes: string): void {
    const mesNumero = this.obtenerNumeroMes(mes);
    if (mesNumero > 0) {
      this.cajaDiariaService.descargarPDFMensual(año, mesNumero);
    }
  }

  /**
   * Convierte el nombre del mes a número (con logging detallado)
   */
  private obtenerNumeroMes(nombreMes: string): number {
    console.log('🔄 [CierreCaja] === CONVIRTIENDO MES A NÚMERO ===');
    console.log('🔄 [CierreCaja] Mes recibido:', nombreMes);
    console.log('🔄 [CierreCaja] Tipo:', typeof nombreMes);
    
    if (!nombreMes) {
      console.warn('⚠️ [CierreCaja] Mes vacío o null');
      return 0;
    }
    
    const meses: { [key: string]: number } = {
      'enero': 1, 'febrero': 2, 'marzo': 3, 'abril': 4,
      'mayo': 5, 'junio': 6, 'julio': 7, 'agosto': 8,
      'septiembre': 9, 'octubre': 10, 'noviembre': 11, 'diciembre': 12
    };
    
    const mesLower = nombreMes.toLowerCase().trim();
    const mesNumero = meses[mesLower] || 0;
    
    console.log('🔄 [CierreCaja] Procesamiento:');
    console.log('   - Mes original:', nombreMes);
    console.log('   - Mes lowercased:', mesLower);
    console.log('   - Número resultante:', mesNumero);
    console.log('   - Meses disponibles:', Object.keys(meses));
    
    if (mesNumero === 0) {
      console.error('❌ [CierreCaja] MES NO RECONOCIDO:', nombreMes);
      console.error('   - Verifique que el mes esté en la lista de meses válidos');
    } else {
      console.log('✅ [CierreCaja] Mes convertido exitosamente:', nombreMes, '→', mesNumero);
    }
    
    return mesNumero;
  }



  /**
   * Convierte respuesta del API a ResponseCierreCaja aplicando filtros y paginación en cliente.
   * La paginación se calcula sobre el conjunto ya filtrado para evitar páginas vacías.
   */
  private convertirCajasAResponse(
    response: any,
    filtros: FiltroCierreCaja,
    pagina: number = 1,
    itemsPorPagina: number = 5
  ): ResponseCierreCaja {

    // Detectar la estructura real de la respuesta
    let cajasArray: CajaReal[] = [];

    if (response && Array.isArray(response)) {
      cajasArray = response;
    } else if (response && response.cajas && Array.isArray(response.cajas)) {
      cajasArray = response.cajas;
    } else if (response && response.data && Array.isArray(response.data)) {
      cajasArray = response.data;
    } else {
      return this.getResponseVacio();
    }

    let cajasConvertidas = cajasArray.map((caja: CajaReal) => this.convertirCajaRealACierreCaja(caja));

    // Filtrar por mes si corresponde
    if (filtros.mes && filtros.mes !== 'todos' && filtros.mes !== '' && filtros.mes !== 'Todos') {
      cajasConvertidas = cajasConvertidas.filter((cierre: CierreCaja) =>
        cierre.mes.toLowerCase() === filtros.mes.toLowerCase()
      );
    }

    // Filtrar por año. Usamos Number() para evitar el problema de coerción string/number
    // que ocurre cuando Angular lee un <select> nativo.
    const anoFiltro = Number(filtros.año);
    if (anoFiltro > 0) {
      cajasConvertidas = cajasConvertidas.filter((cierre: CierreCaja) =>
        cierre.año === anoFiltro
      );
    }

    // Filtrar por búsqueda si corresponde
    if (filtros.busqueda && filtros.busqueda.trim()) {
      const busqueda = filtros.busqueda.toLowerCase();
      cajasConvertidas = cajasConvertidas.filter((cierre: CierreCaja) =>
        cierre.fecha.includes(busqueda) ||
        cierre.montoTotal.toString().includes(busqueda) ||
        cierre.id.toString().includes(busqueda)
      );
    }

    // Calcular paginación sobre el dataset filtrado
    const totalItems = cajasConvertidas.length;
    const totalPaginas = Math.max(1, Math.ceil(totalItems / itemsPorPagina));
    const paginaValida = Math.min(Math.max(1, pagina), totalPaginas);
    const inicio = (paginaValida - 1) * itemsPorPagina;
    const cajasPaginadas = cajasConvertidas.slice(inicio, inicio + itemsPorPagina);

    return {
      cierres: cajasPaginadas,
      paginacion: {
        paginaActual: paginaValida,
        totalPaginas,
        itemsPorPagina,
        totalItems
      }
    };
  }

  /**
   * ✅ CORREGIDO: Convierte CajaReal (estructura del API) a CierreCaja sin problemas de zona horaria
   */
  private convertirCajaRealACierreCaja(caja: CajaReal): CierreCaja {
    // 🔧 CORRECCIÓN: Parsear fecha manualmente para evitar zona horaria UTC
    const fechaOriginal = caja.fecha; // Por ejemplo: "2025-08-23"
    let mesIndex: number;
    let año: number;
    
    try {
      if (fechaOriginal && fechaOriginal.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [añoStr, mesStr, diaStr] = fechaOriginal.split('-');
        
        // ✅ SOLUCIÓN: Parsear componentes manualmente (sin crear Date object que cause problemas UTC)
        mesIndex = parseInt(mesStr) - 1; // 0-indexed para el array de meses
        año = parseInt(añoStr);
        
      } else {
        console.warn('⚠️ [CierreCaja] Formato de fecha no reconocido, usando fallback');
        const fecha = new Date();
        mesIndex = fecha.getMonth();
        año = fecha.getFullYear();
      }
      
    } catch (error) {
      console.error('❌ [CierreCaja] Error al procesar fecha:', error);
      const fecha = new Date();
      mesIndex = fecha.getMonth();
      año = fecha.getFullYear();
    }
    
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    const mesNombre = meses[mesIndex];
    
    // Calcular totales por forma de pago desde el campo 'detalle'
    const formasPago = Object.keys(caja.detalle);
    const totalEfectivo = formasPago.includes('1') ? parseFloat(caja.detalle['1'] || '0') : 0;
    const totalTarjeta = formasPago.includes('2') ? parseFloat(caja.detalle['2'] || '0') : 0;
    const totalTransferencia = formasPago.includes('3') ? parseFloat(caja.detalle['3'] || '0') : 0;
    
    const cierreConvertido: CierreCaja = {
      id: caja.id,
      fecha: fechaOriginal, // ✅ IMPORTANTE: Mantener fecha original del API
      mes: mesNombre,
      año: año,
      montoTotal: PriceUtils.fromApi(caja.total),
      cantidadVentas: caja.ventas,
      ventasPendientes: 0, // La estructura del API no incluye ventas pendientes por caja
      pdfUrl: `/caja/pdf/${fechaOriginal}`, // URL para descarga PDF diaria
      estado: 'cerrado' // Las cajas en el API histórico están cerradas
    };
    

    
    return cierreConvertido;
  }
}