# Ejemplo de Migración: Usar Cliente Selector en Ventas

## Antes (Código actual en ventas.component.ts)

```typescript
// Importaciones actuales
import { NgSelectModule } from '@ng-select/ng-select';
import { ClientesStateService } from '../../services/clientes-state.service';
import { ClienteOperationsService } from './services/cliente-operations.service';

// Propiedades actuales
protected clienteState = this.clientesStateService.state;
mostrarNuevoCliente = false;
nuevoCliente: NuevoCliente = { nombre: '', apellido: '', celular: '' };

// Métodos actuales
toggleNuevoCliente() { /* ... */ }
guardarNuevoCliente() { /* ... */ }
cancelarNuevoCliente() { /* ... */ }
```

## Después (Código propuesto)

```typescript
// Importaciones simplificadas
import { ClienteSelectorComponent } from '../../../shared/components/cliente-selector';

// Propiedades simplificadas
selectedCliente: Cliente | null = null;

// Métodos simplificados
onClienteSeleccionado(cliente: Cliente | null): void {
  this.selectedCliente = cliente;
  if (cliente) {
    this.ventaForm.patchValue({
      cliente_id: cliente.id
    });
  }
}

onNuevoClienteCreado(cliente: Cliente): void {
  console.log('Nuevo cliente creado:', cliente);
  // El cliente ya está seleccionado automáticamente
}
```

## Template HTML - Antes

```html
<!-- Selección de cliente actual -->
<div class="mb-6">
  <label class="block text-sm font-medium text-gray-700 mb-2">Cliente</label>
  <div class="flex gap-2 items-start">
    <div class="flex-1 relative">
      <ng-select
        [items]="clienteState().clientes"
        [clearable]="false"
        [searchable]="true"
        bindLabel="full_name"
        placeholder="Buscar cliente..."
        (change)="onClienteChange($event)">
        <ng-template ng-option-tmp let-item="item">
          {{ item.nombre }} {{ item.apellido }}
        </ng-template>
      </ng-select>
    </div>
    <button type="button"
            (click)="toggleNuevoCliente()"
            class="bg-brand-yellow text-white p-2 rounded-lg hover:bg-brand-orange transition-colors">
      <i class="fas fa-plus"></i>
    </button>
  </div>
  
  <!-- Formulario de nuevo cliente -->
  @if (mostrarNuevoCliente) {
    <div class="mt-4 p-4 bg-gray-50 rounded-lg border">
      <!-- Campos del formulario -->
    </div>
  }
</div>
```

## Template HTML - Después

```html
<!-- Selección de cliente simplificada -->
<div class="mb-6">
  <app-cliente-selector
    placeholder="Buscar cliente..."
    [required]="true"
    [showAddButton]="true"
    (clienteSeleccionado)="onClienteSeleccionado($event)"
    (nuevoClienteCreado)="onNuevoClienteCreado($event)">
  </app-cliente-selector>
</div>
```

## Beneficios de la Migración

### 1. Reducción de Código
- **Antes**: ~200 líneas de código para cliente selector
- **Después**: ~10 líneas de código

### 2. Eliminación de Dependencias
- ❌ Ya no necesita `ClientesStateService`
- ❌ Ya no necesita `ClienteOperationsService`
- ❌ Ya no necesita `NgSelectModule`

### 3. Métodos Eliminados
- `toggleNuevoCliente()`
- `guardarNuevoCliente()`
- `cancelarNuevoCliente()`
- `limpiarNuevoCliente()`

### 4. Propiedades Eliminadas
- `mostrarNuevoCliente`
- `nuevoCliente`
- `clienteState`

## Pasos para Migrar

### 1. Actualizar imports
```typescript
// Remover
import { NgSelectModule } from '@ng-select/ng-select';
import { ClientesStateService } from '../../services/clientes-state.service';
import { ClienteOperationsService } from './services/cliente-operations.service';

// Agregar
import { ClienteSelectorComponent } from '../../../shared/components/cliente-selector';
```

### 2. Actualizar el array de imports del componente
```typescript
@Component({
  imports: [
    // ... otros imports
    ClienteSelectorComponent // Agregar
    // NgSelectModule // Remover
  ]
})
```

### 3. Limpiar el constructor/inject
```typescript
// Remover
private clientesStateService = inject(ClientesStateService);
private clienteOperationsService = inject(ClienteOperationsService);
```

### 4. Actualizar propiedades
```typescript
// Remover
protected clienteState = this.clientesStateService.state;
mostrarNuevoCliente = false;
nuevoCliente: NuevoCliente = { nombre: '', apellido: '', celular: '' };

// Mantener solo
selectedCliente: Cliente | null = null;
```

### 5. Actualizar métodos
```typescript
// Remover todos los métodos de cliente
// Agregar solo estos dos métodos simples
onClienteSeleccionado(cliente: Cliente | null): void {
  this.selectedCliente = cliente;
  if (cliente) {
    this.ventaForm.patchValue({ cliente_id: cliente.id });
  }
}

onNuevoClienteCreado(cliente: Cliente): void {
  console.log('Nuevo cliente creado:', cliente);
}
```

### 6. Actualizar template
Reemplazar todo el bloque de selección de cliente con:
```html
<app-cliente-selector
  placeholder="Buscar cliente..."
  [required]="true"
  (clienteSeleccionado)="onClienteSeleccionado($event)"
  (nuevoClienteCreado)="onNuevoClienteCreado($event)">
</app-cliente-selector>
```

## Resultado Final

- ✅ **Menos código**: Reducción del 95% en líneas de código
- ✅ **Más mantenible**: Lógica centralizada en un componente
- ✅ **Más consistente**: UI uniforme en toda la aplicación
- ✅ **Más testeable**: Componente independiente fácil de probar
- ✅ **Más reutilizable**: Mismo componente para ventas, cuadros, etc.
