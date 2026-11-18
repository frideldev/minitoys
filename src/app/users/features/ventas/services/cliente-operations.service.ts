import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ClientesStateService } from '../../../services/clientes-state.service';
import { ClientesService } from '../../../services/clientes.service';
import { Cliente } from '../../../interfaces/cliente.interface';
import { NuevoCliente } from '../interfaces/item-venta.interface';

@Injectable({
  providedIn: 'root'
})
export class ClienteOperationsService {
  private clientesState = inject(ClientesStateService);
  private clientesService = inject(ClientesService);

  async crearCliente(nuevoCliente: NuevoCliente): Promise<{ success: boolean; error?: string; cliente?: Cliente }> {
    if (!nuevoCliente.nombre || !nuevoCliente.celular) {
      return { success: false, error: 'Nombre y celular son requeridos' };
    }

    try {
      const clienteData: Cliente = {
        nombre: nuevoCliente.nombre,
        apellido: nuevoCliente.apellido || '',
        telefono: nuevoCliente.celular,
        email: '',
        direccion: '',
        ci: '',
        fechaNacimiento: '',
        full_name: `${nuevoCliente.nombre} ${nuevoCliente.apellido}`.trim()
      };

      // Llamar directamente al servicio para obtener el cliente creado con su id
      const createdCliente = await firstValueFrom(this.clientesService.createCliente(clienteData));

      // Refrescar la lista de clientes en el estado
      this.clientesState.refreshData();

      return { success: true, cliente: createdCliente };
    } catch (error) {
      return { success: false, error: 'Error al crear el cliente' };
    }
  }

  limpiarDatosNuevoCliente(): NuevoCliente {
    return {
      nombre: '',
      apellido: '',
      celular: ''
    };
  }
}
