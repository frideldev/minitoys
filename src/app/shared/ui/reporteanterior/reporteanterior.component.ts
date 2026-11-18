import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CierreCajaService } from './services/cierre-caja.service';
import { CierreCaja, FiltroCierreCaja, ResponseCierreCaja } from './interfaces/cierre-caja.interface';

@Component({
  selector: 'app-reporteanterior',
  imports: [CommonModule, FormsModule],
  templateUrl: './reporteanterior.component.html',
  styleUrl: './reporteanterior.component.css'
})
export class ReporteanteriorComponent implements OnInit {
  private cierreCajaService = inject(CierreCajaService);

  // Signals para estado reactivo
  cierres = signal<CierreCaja[]>([]);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);
  
  // Filtros
  filtros = signal<FiltroCierreCaja>({
    mes: '',
    año: new Date().getFullYear(),
    busqueda: ''
  });

  // Paginación
  paginaActual = signal<number>(1);
  totalPaginas = signal<number>(1);
  itemsPorPagina = signal<number>(5); // Cambiado a 5 items por página
  totalItems = signal<number>(0);

  // Opciones de filtros
  mesesDisponibles: string[] = [];
  anosDisponibles: number[] = [];
  mesActual: string = '';
  // Lista completa de cierres (sin paginar) — usada para derivar el año real por mes
  private todosCierres: CierreCaja[] = [];

  // Propiedades para el template
  busquedaInput = '';
  mesSeleccionado = '';
  anoSeleccionado: number = 0; // 0 = Todos

  ngOnInit() {
    this.inicializarComponente();
  }

  private inicializarComponente() {
    // CAMBIO IMPORTANTE: Cargar PRIMERO todas las cajas para detectar meses disponibles
    this.detectarMesesDisponiblesDelAPI();
  }

  /**
   * Detecta los meses disponibles desde el API real y luego configura los filtros.
   * Usa la lista COMPLETA de cierres (sin paginar) para derivar correctamente el año de cada mes.
   */
  private detectarMesesDisponiblesDelAPI() {
    this.cierreCajaService.getTodosCierresParaDeteccion()
      .subscribe({
        next: (todos) => {
          this.todosCierres = todos;

          const mesesEncontrados = this.extraerMesesUnicos(todos);

          // Sin "Todos" — solo los meses reales con datos
          this.mesesDisponibles = mesesEncontrados;

          const mesActual = this.cierreCajaService.getMesActual();
          const mesDefault = mesesEncontrados.includes(mesActual) ? mesActual : mesesEncontrados[0] || '';

          this.mesActual = mesDefault;
          this.mesSeleccionado = mesDefault;

          // Años disponibles para el mes por defecto (sin "Todos")
          this.anosDisponibles = this.getAnosParaMes(mesDefault);
          this.anoSeleccionado = this.anosDisponibles[0] ?? new Date().getFullYear();

          this.filtros.set({ mes: mesDefault, año: this.anoSeleccionado, busqueda: '' });

          this.cargarCierres();
        },
        error: (error) => {
          console.error('❌ [ReporteAnterior] Error al detectar meses disponibles:', error);

          this.mesesDisponibles = this.cierreCajaService.getMesesDisponibles().filter(m => m !== 'Todos');
          this.mesActual = this.cierreCajaService.getMesActual();
          this.mesSeleccionado = this.mesActual;
          this.anosDisponibles = [new Date().getFullYear()];
          this.anoSeleccionado = new Date().getFullYear();

          this.filtros.set({ mes: this.mesActual, año: this.anoSeleccionado, busqueda: '' });

          this.cargarCierres();
        }
      });
  }

  /**
   * Extrae meses únicos de las fechas reales del API (CORREGIDO para evitar zona horaria UTC)
   */
  private extraerMesesUnicos(cierres: any[]): string[] {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    const mesesEncontrados = new Set<string>();
    
    cierres.forEach(cierre => {
      if (cierre.fecha) {
        try {
          // ✅ CORRECCIÓN: Parsear fecha manualmente para evitar zona horaria UTC
          if (cierre.fecha.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const [año, mes, dia] = cierre.fecha.split('-');
            const mesIndex = parseInt(mes) - 1; // JavaScript usa 0-indexed para meses
            
            if (mesIndex >= 0 && mesIndex < 12) {
              const nombreMes = meses[mesIndex];
              mesesEncontrados.add(nombreMes);
              console.log('✅ [ReporteAnterior] Mes detectado correctamente:', cierre.fecha, '→', nombreMes);
            } else {
              console.warn('⚠️ [ReporteAnterior] Índice de mes fuera de rango:', mesIndex);
            }
          } else {
            console.warn('⚠️ [ReporteAnterior] Formato de fecha no reconocido:', cierre.fecha);
          }
        } catch (error) {
          console.warn('⚠️ [ReporteAnterior] Error al procesar fecha:', cierre.fecha, error);
        }
      }
    });
    
    // Ordenar meses por orden cronológico
    const mesesOrdenados = meses.filter(mes => mesesEncontrados.has(mes));
    console.log('📅 [ReporteAnterior] Meses ordenados cronológicamente:', mesesOrdenados);
    
    return mesesOrdenados;
  }

  /**
   * Extrae los años únicos de la lista de cierres, ordenados de más reciente a más antiguo.
   */
  private extraerAñosUnicos(cierres: CierreCaja[]): number[] {
    const añosSet = new Set<number>(cierres.map(c => c.año).filter(a => a > 0));
    return [...añosSet].sort((a, b) => b - a);
  }

  /**
   * Retorna los años disponibles para un mes específico, en orden descendente.
   */
  private getAnosParaMes(mes: string): number[] {
    if (!mes) return this.extraerAñosUnicos(this.todosCierres);
    const anosSet = new Set<number>(
      this.todosCierres
        .filter(c => c.mes.toLowerCase() === mes.toLowerCase())
        .map(c => c.año)
        .filter(a => a > 0)
    );
    return [...anosSet].sort((a, b) => b - a);
  }

  /**
   * Extrae el año real de la lista de cierres para un mes dado
   */
  private extraerAnioParaMes(cierres: any[], mes: string): number {
    const cierreDelMes = cierres.find(c => c.mes?.toLowerCase() === mes.toLowerCase());
    if (cierreDelMes?.año) return cierreDelMes.año;
    if (cierres[0]?.año) return cierres[0].año;
    return new Date().getFullYear();
  }

  /**
   * Carga los cierres de caja con filtros actuales
   */
  cargarCierres() {
    this.isLoading.set(true);
    this.error.set(null);

    this.cierreCajaService.getCierresCaja(this.filtros(), this.paginaActual())
      .subscribe({
        next: (response: ResponseCierreCaja) => {
          this.cierres.set(response.cierres);
          this.totalPaginas.set(response.paginacion.totalPaginas);
          this.itemsPorPagina.set(response.paginacion.itemsPorPagina);
          this.totalItems.set(response.paginacion.totalItems);
          this.isLoading.set(false);
        },
        error: (error) => {
          this.error.set('Error al cargar los cierres de caja');
          this.isLoading.set(false);
          console.error('Error:', error);
        }
      });
  }

  /**
   * Maneja el cambio de mes en el select.
   * Recalcula los años disponibles para ese mes y auto-selecciona el más reciente.
   */
  onMesChange() {
    const nuevoMes = this.mesSeleccionado;
    // Recalcular años para el nuevo mes
    this.anosDisponibles = this.getAnosParaMes(nuevoMes);
    const nuevoAno = this.anosDisponibles[0] ?? new Date().getFullYear();
    this.anoSeleccionado = nuevoAno;
    this.filtros.update(f => ({ ...f, mes: nuevoMes, año: nuevoAno }));
    this.paginaActual.set(1);
    this.cargarCierres();
  }

  /**
   * Maneja el cambio de año en el select.
   * Number() resuelve la coerción de string que hace el DOM nativo del select.
   */
  onAnoChange() {
    const nuevoAno = Number(this.anoSeleccionado);
    this.filtros.update(f => ({ ...f, año: nuevoAno }));
    this.paginaActual.set(1);
    this.cargarCierres();
  }

  /**
   * Maneja la búsqueda con debounce
   */
  onBusquedaChange() {
    // Actualizar filtros con la búsqueda
    this.filtros.update(filtros => ({ ...filtros, busqueda: this.busquedaInput }));
    this.paginaActual.set(1);
    this.cargarCierres();
  }

  /**
   * Limpia la búsqueda
   */
  limpiarBusqueda() {
    this.busquedaInput = '';
    this.onBusquedaChange();
  }

  /**
   * Navega a una página específica
   */
  irAPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas()) {
      this.paginaActual.set(pagina);
      this.cargarCierres();
    }
  }

  /**
   * Navega a la página anterior
   */
  paginaAnterior() {
    if (this.paginaActual() > 1) {
      this.irAPagina(this.paginaActual() - 1);
    }
  }

  /**
   * Navega a la página siguiente
   */
  paginaSiguiente() {
    if (this.paginaActual() < this.totalPaginas()) {
      this.irAPagina(this.paginaActual() + 1);
    }
  }

  /**
   * Genera array de números para paginación con máximo 3 páginas visibles
   */
  get paginasVisibles(): number[] {
    const totalPag = this.totalPaginas();
    const actual = this.paginaActual();
    const maxVisibles = 3;
    
    if (totalPag <= maxVisibles) {
      return Array.from({ length: totalPag }, (_, i) => i + 1);
    }
    
    // Calcular el rango de páginas visibles
    let inicio = Math.max(1, actual - Math.floor(maxVisibles / 2));
    let fin = Math.min(totalPag, inicio + maxVisibles - 1);
    
    // Ajustar si estamos cerca del final
    if (fin - inicio + 1 < maxVisibles) {
      inicio = Math.max(1, fin - maxVisibles + 1);
    }
    
    return Array.from({ length: fin - inicio + 1 }, (_, i) => inicio + i);
  }

  /**
   * Genera array de números para paginación (deprecado, usar paginasVisibles)
   */
  get paginasArray(): number[] {
    return this.paginasVisibles;
  }

  /**
   * Imprimir reporte PDF mensual usando la API real
   */
  imprimirReportePDF() {
    const f = this.filtros();
    const mes = (f.mes && f.mes !== '') ? f.mes : this.cierreCajaService.getMesActual();
    const ano = Number(f.año) > 0 ? Number(f.año) : this.extraerAnioParaMes(this.todosCierres, mes);
    this.cierreCajaService.descargarPDFMensual(ano, mes);
  }

  /**
   * Descargar PDF del cierre de caja
   */
  descargarPDF(cierre: any, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    // Usar la fecha real del cierre, no el ID
    this.cierreCajaService.descargarPDF(cierre.fecha);
  }

  /**
   * Formatea el monto como moneda
   */
  formatearMoneda(monto: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'BOB',
      minimumFractionDigits: 2
    }).format(monto).replace('BOB', 'Bs');
  }

  /**
   * ✅ CORREGIDO: Formatea la fecha para mostrar (sin problemas de zona horaria)
   */
  formatearFecha(fecha: string): string {
    try {
      // 🔧 CORRECCIÓN: Parsear fecha manualmente para evitar zona horaria UTC
      if (fecha && fecha.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [añoStr, mesStr, diaStr] = fecha.split('-');
        
        // Crear fecha local (sin UTC) - mes es 0-indexed en JavaScript
        const añoNum = parseInt(añoStr);
        const mesNum = parseInt(mesStr) - 1; // 0-indexed para Date
        const diaNum = parseInt(diaStr);
        
        // ✅ SOLUCIÓN: Crear Date con componentes locales (no UTC)
        const fechaLocal = new Date(añoNum, mesNum, diaNum);
        
        const fechaFormateada = fechaLocal.toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        
        return fechaFormateada;
        
      } else {
        console.warn("⚠️ [formatearFecha] Formato de fecha no reconocido:", fecha);
        return fecha; // Devolver original si no se puede parsear
      }
      
    } catch (error) {
      console.error("❌ [formatearFecha] Error al formatear fecha:", error);
      return fecha; // Devolver original en caso de error
    }
  }

  /**
   * Obtiene la clase CSS para el estado
   */
  getEstadoClass(estado: string): string {
    return estado === 'cerrado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  }

  /**
   * Obtiene el icono para el estado
   */
  getEstadoIcon(estado: string): string {
    return estado === 'cerrado' ? 'fas fa-check-circle' : 'fas fa-clock';
  }

  /**
   * Obtiene el año del filtro (evita problemas con ñ en template)
   */
  getAnoFiltro(): number {
    return Number(this.filtros().año) || new Date().getFullYear();
  }


}
