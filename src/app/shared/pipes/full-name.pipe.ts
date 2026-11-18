import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fullName',
  standalone: true
})
export class FullNamePipe implements PipeTransform {
  transform(cliente: any): string {
    return `${cliente.nombre} ${cliente.apellido}`;
  }
}