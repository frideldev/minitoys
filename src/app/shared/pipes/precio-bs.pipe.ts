import { Pipe, PipeTransform } from '@angular/core';
import { PriceUtils } from '../utils/price.utils';

/**
 * PrecioBsPipe
 *
 * Convierte un valor almacenado en centavos (unidad interna del backend, ×100)
 * a Bolivianos para mostrar en la UI.
 *
 * USO EN TEMPLATE:
 *   {{ item.precioCompra | precioBs | number:'1.2-2' }}   → "100.00"
 *   {{ item.precioVenta  | precioBs | number:'1.2-2' }}   → "120.00"
 *
 * Si el dato ya viene normalizado (fromApi ya aplicado) el pipe no se usa;
 * sólo es necesario en componentes que muestran directamente valores crudos del API sin pasar por el service de normalización.
 */
@Pipe({
  name: 'precioBs',
  standalone: true
})
export class PrecioBsPipe implements PipeTransform {
  transform(value: number | string | null | undefined): number {
    return PriceUtils.fromApi(value);
  }
}
