# Cliente Selector Component

Un componente reutilizable para seleccionar clientes con funcionalidad de búsqueda y creación de nuevos clientes.

## Características

- 🔍 **Búsqueda avanzada**: Dropdown con búsqueda por nombre, apellido o celular
- ➕ **Nuevo cliente**: Formulario inline para crear nuevos clientes
- ✅ **Validación**: Validación de campos requeridos
- 🎨 **Responsive**: Diseño adaptable para desktop y móvil
- 🔄 **Reactive**: Implementa ControlValueAccessor para usar con reactive forms
- 🎯 **Accesible**: Diseño accesible con soporte para lectores de pantalla

## Uso Básico

### 1. Importar el componente

```typescript
import { ClienteSelectorComponent } from '../../../shared/components/cliente-selector';

@Component({
  selector: 'app-mi-componente',
  imports: [
    // otros imports...
    ClienteSelectorComponent
  ],
  // ...
})
```

### 2. Usar en el template

```html
<!-- Uso básico -->
<app-cliente-selector
  placeholder="Buscar cliente..."
  [required]="true"
  [showAddButton]="true"
  (clienteSeleccionado)="onClienteSeleccionado($event)"
  (nuevoClienteCreado)="onNuevoClienteCreado($event)">
</app-cliente-selector>

<!-- Uso con reactive forms -->
<form [formGroup]="miFormulario">
  <app-cliente-selector
    formControlName="cliente"
    placeholder="Seleccionar cliente"
    [required]="true">
  </app-cliente-selector>
</form>
```

### 3. Manejar eventos en el componente

```typescript
export class MiComponente {
  // Maneja cuando se selecciona un cliente
  onClienteSeleccionado(cliente: Cliente | null): void {
    console.log('Cliente seleccionado:', cliente);
    // Actualizar el formulario o realizar otras acciones
  }

  // Maneja cuando se crea un nuevo cliente
  onNuevoClienteCreado(cliente: Cliente): void {
    console.log('Nuevo cliente creado:', cliente);
    // El cliente ya está seleccionado automáticamente
  }
}
```

## Propiedades de Entrada (Inputs)

| Propiedad | Tipo | Valor por defecto | Descripción |
|-----------|------|-------------------|-------------|
| `placeholder` | `string` | `'Buscar cliente...'` | Texto del placeholder |
| `disabled` | `boolean` | `false` | Deshabilita el componente |
| `required` | `boolean` | `false` | Marca el campo como requerido |
| `showAddButton` | `boolean` | `true` | Muestra el botón para agregar nuevo cliente |

## Eventos de Salida (Outputs)

| Evento | Tipo | Descripción |
|--------|------|-------------|
| `clienteSeleccionado` | `EventEmitter<Cliente \| null>` | Se emite cuando se selecciona un cliente |
| `nuevoClienteCreado` | `EventEmitter<Cliente>` | Se emite cuando se crea un nuevo cliente |

## Uso con Reactive Forms

El componente implementa `ControlValueAccessor`, por lo que puede usarse directamente con reactive forms:

```typescript
// En el componente
miFormulario = this.fb.group({
  cliente: ['', Validators.required],
  // otros campos...
});

// En el template
<form [formGroup]="miFormulario">
  <app-cliente-selector formControlName="cliente"></app-cliente-selector>
</form>

// Obtener el valor
const clienteSeleccionado = this.miFormulario.get('cliente')?.value;
```

## Dependencias

- `@ng-select/ng-select`: Para el dropdown avanzado
- `ClientesStateService`: Para la gestión de estado de clientes
- `ClienteOperationsService`: Para operaciones CRUD de clientes

## Estados del Componente

- **Cargando**: Muestra un spinner mientras se cargan los clientes
- **Seleccionado**: Muestra el cliente seleccionado
- **Creando**: Muestra el formulario para crear un nuevo cliente
- **Error**: Muestra mensajes de error en la validación

## Personalización

El componente utiliza las clases CSS del sistema de diseño:
- `bg-brand-yellow`: Color amarillo de la marca
- `bg-brand-orange`: Color naranja de la marca
- `focus:ring-brand-orange`: Anillo de enfoque naranja

## Estructura de Archivos

```
src/app/shared/components/cliente-selector/
├── cliente-selector.component.ts
├── cliente-selector.component.html
├── cliente-selector.component.css
└── index.ts
```

## Ejemplo Completo

```typescript
// mi-componente.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClienteSelectorComponent } from '../../../shared/components/cliente-selector';
import { Cliente } from '../../../users/interfaces/cliente.interface';

@Component({
  selector: 'app-mi-componente',
  imports: [
    ReactiveFormsModule,
    ClienteSelectorComponent
  ],
  template: `
    <form [formGroup]="miFormulario" (ngSubmit)="onSubmit()">
      <app-cliente-selector
        formControlName="cliente"
        placeholder="Seleccionar cliente"
        [required]="true"
        (clienteSeleccionado)="onClienteSeleccionado($event)"
        (nuevoClienteCreado)="onNuevoClienteCreado($event)">
      </app-cliente-selector>
      
      <button type="submit" [disabled]="miFormulario.invalid">
        Guardar
      </button>
    </form>
  `
})
export class MiComponente implements OnInit {
  private fb = inject(FormBuilder);
  
  miFormulario: FormGroup = this.fb.group({
    cliente: ['', Validators.required]
  });

  ngOnInit(): void {
    // Inicialización
  }

  onClienteSeleccionado(cliente: Cliente | null): void {
    if (cliente) {
      console.log('Cliente seleccionado:', cliente.nombre, cliente.apellido);
    }
  }

  onNuevoClienteCreado(cliente: Cliente): void {
    console.log('Nuevo cliente creado y seleccionado:', cliente);
  }

  onSubmit(): void {
    if (this.miFormulario.valid) {
      const cliente = this.miFormulario.get('cliente')?.value;
      console.log('Formulario enviado con cliente:', cliente);
    }
  }
}
```

## Beneficios de la Reutilización

1. **Consistencia**: UI uniforme en toda la aplicación
2. **Mantenibilidad**: Cambios centralizados en un solo lugar
3. **Productividad**: Menos código duplicado
4. **Calidad**: Lógica probada y validada
5. **Escalabilidad**: Fácil de extender y personalizar
