import { Component, Input, Output, EventEmitter, OnInit, inject, forwardRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule, FormControl, Validators, FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { ClientesStateService } from '../../../users/services/clientes-state.service';
import { Cliente } from '../../../users/interfaces/cliente.interface';
import { NuevoCliente } from '../../../users/features/ventas/interfaces/item-venta.interface';
import { ClienteOperationsService } from '../../../users/features/ventas/services/cliente-operations.service';

@Component({
  selector: 'app-cliente-selector',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgSelectModule
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ClienteSelectorComponent),
      multi: true
    }
  ],
  templateUrl: './cliente-selector.component.html',
  styleUrls: ['./cliente-selector.component.css']
})
export class ClienteSelectorComponent implements OnInit, ControlValueAccessor {
  @Input() placeholder = 'Buscar cliente...';
  @Input() disabled = false;
  @Input() required = false;
  @Input() showAddButton = true;
  @Input() autoSelectGenerico = false;
  @Output() clienteSeleccionado = new EventEmitter<Cliente | null>();
  @Output() nuevoClienteCreado = new EventEmitter<Cliente>();

  private clientesStateService = inject(ClientesStateService);
  private clienteOperationsService = inject(ClienteOperationsService);

  // Estado del componente
  selectedCliente: Cliente | null = null;
  mostrarNuevoCliente = false;
  isLoading = false;

  // Datos del nuevo cliente
  nuevoCliente: NuevoCliente = { nombre: '', apellido: '', celular: '' };

  // Form controls para validación
  nombreControl = new FormControl('', [Validators.required]);
  apellidoControl = new FormControl('', [Validators.required]);
  celularControl = new FormControl('', [Validators.required]);

  // Estados reactivos
  protected clienteState = this.clientesStateService.state;

  // Preselecciona el cliente genérico cuando no hay ninguno elegido
  private autoSelectEffect = effect(() => {
    const clientes = this.clienteState().clientes;
    if (this.autoSelectGenerico && !this.selectedCliente && clientes.length > 0) {
      this.seleccionarGenerico();
    }
  });

  // ControlValueAccessor callbacks
  private onChange = (value: any) => {};
  private onTouched = () => {};

  ngOnInit(): void {
    // Cargar clientes si no están cargados
    if (this.clienteState().clientes.length === 0) {
      this.clientesStateService.refreshData();
    }
  }

  seleccionarGenerico(): void {
    const generico = this.clienteState().clientes.find(c =>
      /gen[eé]rico/i.test(`${c.nombre ?? ''} ${c.apellido ?? ''} ${c.full_name ?? ''}`)
    );
    if (generico) {
      this.onClienteChange(generico);
    }
  }

  // ControlValueAccessor implementation
  writeValue(value: any): void {
    this.selectedCliente = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  /**
   * Compara clientes por id para ng-select (evita pérdida de selección al refrescar la lista)
   */
  compareClientes = (a: Cliente, b: Cliente): boolean => {
    return a?.id != null && b?.id != null && a.id === b.id;
  };

  /**
   * Maneja el cambio de cliente seleccionado
   */
  onClienteChange(cliente: Cliente | null): void {
    this.selectedCliente = cliente;
    this.onChange(cliente);
    this.onTouched();
    this.clienteSeleccionado.emit(cliente);
  }

  /**
   * Toggle para mostrar/ocultar formulario de nuevo cliente
   */
  toggleNuevoCliente(): void {
    this.mostrarNuevoCliente = !this.mostrarNuevoCliente;
    if (this.mostrarNuevoCliente) {
      this.limpiarFormularioNuevoCliente();
    }
  }

  /**
   * Guarda un nuevo cliente
   */
  async guardarNuevoCliente(): Promise<void> {
    // Validar campos
    this.nombreControl.setValue(this.nuevoCliente.nombre);
    this.apellidoControl.setValue(this.nuevoCliente.apellido);
    this.celularControl.setValue(this.nuevoCliente.celular);

    this.nombreControl.markAsTouched();
    this.apellidoControl.markAsTouched();
    this.celularControl.markAsTouched();

    if (this.nombreControl.invalid || this.apellidoControl.invalid || this.celularControl.invalid) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    this.isLoading = true;

    try {
      const result = await this.clienteOperationsService.crearCliente(this.nuevoCliente);
      
      if (result.success) {
        this.limpiarFormularioNuevoCliente();
        this.mostrarNuevoCliente = false;

        // Seleccionar el nuevo cliente inmediatamente antes de cualquier refresh
        if (result.cliente) {
          this.onClienteChange(result.cliente);
          this.nuevoClienteCreado.emit(result.cliente);
        }

        alert('Cliente creado exitosamente');

        // Actualizar la lista de clientes en segundo plano
        this.clientesStateService.refreshData();
      } else {
        alert(`Error al crear cliente: ${result.error}`);
      }
    } catch (error) {
      console.error('Error al crear cliente:', error);
      alert('Error inesperado al crear cliente');
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Cancela la creación de nuevo cliente
   */
  cancelarNuevoCliente(): void {
    this.limpiarFormularioNuevoCliente();
    this.mostrarNuevoCliente = false;
  }

  /**
   * Limpia el formulario de nuevo cliente
   */
  private limpiarFormularioNuevoCliente(): void {
    this.nuevoCliente = { nombre: '', apellido: '', celular: '' };
    this.nombreControl.setValue('');
    this.apellidoControl.setValue('');
    this.celularControl.setValue('');
    this.nombreControl.markAsUntouched();
    this.apellidoControl.markAsUntouched();
    this.celularControl.markAsUntouched();
  }

  /**
   * Verifica si el formulario de nuevo cliente es válido
   */
  isFormValid(): boolean {
    return this.nuevoCliente.nombre.trim() !== '' &&
           this.nuevoCliente.apellido.trim() !== '' &&
           this.nuevoCliente.celular.trim() !== '';
  }

  /**
   * Obtiene el mensaje de error para un campo
   */
  getErrorMessage(field: 'nombre' | 'apellido' | 'celular'): string {
    const control = field === 'nombre' ? this.nombreControl : 
                   field === 'apellido' ? this.apellidoControl : this.celularControl;
    
    if (control.hasError('required')) {
      return `${field.charAt(0).toUpperCase() + field.slice(1)} es requerido`;
    }
    return '';
  }

  /**
   * Verifica si un campo tiene error
   */
  hasError(field: 'nombre' | 'apellido' | 'celular'): boolean {
    const control = field === 'nombre' ? this.nombreControl : 
                   field === 'apellido' ? this.apellidoControl : this.celularControl;
    return control.invalid && control.touched;
  }
}
