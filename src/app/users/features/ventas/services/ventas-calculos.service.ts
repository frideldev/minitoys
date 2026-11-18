import { Injectable } from '@angular/core';
import { Venta, DetalleVentaProducto, DetalleVentaPersonalizada } from '../interfaces/venta.interface';

export interface EstadisticasVentas {
  totalVentas: number;
  totalIngresos: number;
  totalProductos: number;
  totalCuadrosPersonalizados: number;
  promedioVenta: number;
  ventasCompletadas: number;
  ventasPendientes: number;
  porcentajeCompletadas: number;
}

@Injectable({
  providedIn: 'root'
})
export class VentasCalculosService {

  /**
   * Calcula estadísticas generales de las ventas
   */
  calcularEstadisticas(ventas: Venta[]): EstadisticasVentas {
    const totalVentas = ventas.length;
    const totalIngresos = this.calcularIngresosTotales(ventas);
    const totalProductos = this.contarProductosVendidos(ventas);
    const totalCuadrosPersonalizados = this.contarCuadrosPersonalizados(ventas);
    const promedioVenta = totalVentas > 0 ? totalIngresos / totalVentas : 0;
    const ventasCompletadas = ventas.filter(v => v.recogido).length;
    const ventasPendientes = totalVentas - ventasCompletadas;
    const porcentajeCompletadas = totalVentas > 0 ? (ventasCompletadas / totalVentas) * 100 : 0;

    return {
      totalVentas,
      totalIngresos,
      totalProductos,
      totalCuadrosPersonalizados,
      promedioVenta,
      ventasCompletadas,
      ventasPendientes,
      porcentajeCompletadas
    };
  }

  /**
   * Calcula el total de ingresos de todas las ventas
   */
  calcularIngresosTotales(ventas: Venta[]): number {
    return ventas.reduce((total, venta) => total + (venta.precioTotal || 0), 0);
  }

  /**
   * Calcula el total de ingresos solo de ventas completadas
   */
  calcularIngresosCompletados(ventas: Venta[]): number {
    return ventas
      .filter(venta => venta.recogido)
      .reduce((total, venta) => total + (venta.precioTotal || 0), 0);
  }

  /**
   * Calcula el total de saldos pendientes (preventas)
   */
  calcularSaldosPendientes(ventas: Venta[]): number {
    return ventas
      .filter(venta => !venta.recogido)
      .reduce((total, venta) => total + (venta.saldoFalante || 0), 0);
  }

  /**
   * Cuenta el total de productos vendidos
   */
  contarProductosVendidos(ventas: Venta[]): number {
    return ventas.reduce((total, venta) => {
      if (venta.detalle_venta_productos) {
        return total + venta.detalle_venta_productos.reduce((subtotal, detalle) => 
          subtotal + (detalle.cantidad || 0), 0
        );
      }
      return total;
    }, 0);
  }

  /**
   * Cuenta el total de cuadros personalizados vendidos
   */
  contarCuadrosPersonalizados(ventas: Venta[]): number {
    return ventas.reduce((total, venta) => {
      if (venta.detalle_venta_personalizadas) {
        return total + venta.detalle_venta_personalizadas.length;
      }
      return total;
    }, 0);
  }

  /**
   * Obtiene las ventas del día actual
   */
  obtenerVentasDelDia(ventas: Venta[]): Venta[] {
    const hoy = new Date();
    const inicioDelDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    const finDelDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 1);

    return ventas.filter(venta => {
      const fechaVenta = new Date(venta.fecha);
      return fechaVenta >= inicioDelDia && fechaVenta < finDelDia;
    });
  }

  /**
   * Obtiene las ventas del mes actual
   */
  obtenerVentasDelMes(ventas: Venta[]): Venta[] {
    const hoy = new Date();
    const inicioDelMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const finDelMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 1);

    return ventas.filter(venta => {
      const fechaVenta = new Date(venta.fecha);
      return fechaVenta >= inicioDelMes && fechaVenta < finDelMes;
    });
  }

  /**
   * Agrupa ventas por fecha
   */
  agruparVentasPorFecha(ventas: Venta[]): { [fecha: string]: Venta[] } {
    return ventas.reduce((grupos, venta) => {
      const fecha = new Date(venta.fecha).toISOString().split('T')[0];
      if (!grupos[fecha]) {
        grupos[fecha] = [];
      }
      grupos[fecha].push(venta);
      return grupos;
    }, {} as { [fecha: string]: Venta[] });
  }

  /**
   * Calcula ingresos por día para gráficos
   */
  calcularIngresosPorDia(ventas: Venta[], diasAtras: number = 7): { fecha: string; ingresos: number }[] {
    const hoy = new Date();
    const resultado = [];

    for (let i = diasAtras - 1; i >= 0; i--) {
      const fecha = new Date(hoy);
      fecha.setDate(fecha.getDate() - i);
      const fechaStr = fecha.toISOString().split('T')[0];
      
      const ventasDelDia = ventas.filter(venta => {
        const fechaVenta = new Date(venta.fecha).toISOString().split('T')[0];
        return fechaVenta === fechaStr;
      });

      const ingresos = this.calcularIngresosTotales(ventasDelDia);
      resultado.push({ fecha: fechaStr, ingresos });
    }

    return resultado;
  }

  /**
   * Obtiene las ventas con mayor valor
   */
  obtenerVentasTop(ventas: Venta[], limite: number = 5): Venta[] {
    return [...ventas]
      .sort((a, b) => (b.precioTotal || 0) - (a.precioTotal || 0))
      .slice(0, limite);
  }

  /**
   * Calcula el valor promedio de cuadros personalizados
   */
  calcularPromedioVentaCuadros(ventas: Venta[]): number {
    const ventasConCuadros = ventas.filter(venta => 
      venta.detalle_venta_personalizadas && venta.detalle_venta_personalizadas.length > 0
    );

    if (ventasConCuadros.length === 0) return 0;

    const totalCuadros = ventasConCuadros.reduce((total, venta) => 
      total + (venta.precioTotal || 0), 0
    );

    return totalCuadros / ventasConCuadros.length;
  }

  /**
   * Obtiene estadísticas de materiales más usados en cuadros
   */
  obtenerMaterialesMasUsados(ventas: Venta[]): { [material: string]: number } {
    const conteoMateriales: { [material: string]: number } = {};

    ventas.forEach(venta => {
      if (venta.detalle_venta_personalizadas) {
        venta.detalle_venta_personalizadas.forEach(cuadro => {
          if (cuadro.materia_prima_varilla) {
            const key = `Varilla: ${cuadro.materia_prima_varilla.descripcion}`;
            conteoMateriales[key] = (conteoMateriales[key] || 0) + 1;
          }
          if (cuadro.materia_prima_vidrio) {
            const key = `Vidrio: ${cuadro.materia_prima_vidrio.descripcion}`;
            conteoMateriales[key] = (conteoMateriales[key] || 0) + 1;
          }
          if (cuadro.materia_prima_contorno) {
            const key = `Contorno: ${cuadro.materia_prima_contorno.descripcion}`;
            conteoMateriales[key] = (conteoMateriales[key] || 0) + 1;
          }
          if (cuadro.materia_prima_trupan) {
            const key = `Trupán: ${cuadro.materia_prima_trupan.descripcion}`;
            conteoMateriales[key] = (conteoMateriales[key] || 0) + 1;
          }
        });
      }
    });

    return conteoMateriales;
  }
}
