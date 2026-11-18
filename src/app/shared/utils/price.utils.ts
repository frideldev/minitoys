/**
 * PriceUtils – Conversión centralizada entre Bolivianos y la unidad interna del backend.
 *
 * CONTRATO DE LA API:
 *   - El backend almacena precioCompra y precioVenta multiplicados por 100
 *     (p.ej. 100 Bs → 10000 en la BD).
 *   - Al RECIBIR datos del API hay que dividir entre 100 para mostrar en Bs.
 *   - Al ENVIAR datos al API hay que multiplicar por 100.
 *
 * USO:
 *   import { PriceUtils } from '...shared/utils/price.utils';
 *
 *   // Recibir (normalizar respuesta de la API)
 *   const precioEnBs = PriceUtils.fromApi(itemDelApi.precioCompra); // 10000 → 100
 *
 *   // Enviar (preparar payload para la API)
 *   const centavos = PriceUtils.toApi(formularioEnBs.precioCompra); // 100 → 10000
 *
 *   // Normalizar un objeto completo (útil en service.map())
 *   const item = PriceUtils.normalizeItem(apiResponse);
 */
export class PriceUtils {
  /** API centavos → Bs para mostrar */
  static fromApi(value: number | string | null | undefined): number {
    if (value == null || value === '') return 0;
    return Number(value) / 100;
  }

  /** Bs ingresados por el usuario → centavos para enviar al API */
  static toApi(value: number | string | null | undefined): number {
    if (value == null || value === '') return 0;
    return Math.round(Number(value) * 100);
  }

  /**
   * Normaliza los campos precioCompra y precioVenta de un objeto recibido del API.
   * Devuelve un nuevo objeto (no muta el original).
   */
  static normalizeItem<T extends { precioCompra?: any; precioVenta?: any }>(item: T): T {
    return {
      ...item,
      ...(item.precioCompra != null && { precioCompra: PriceUtils.fromApi(item.precioCompra) }),
      ...(item.precioVenta != null  && { precioVenta:  PriceUtils.fromApi(item.precioVenta)  }),
    };
  }
}
