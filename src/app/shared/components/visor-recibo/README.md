# Componente VisorRecibo - Documentación

## Descripción
El `VisorReciboComponent` es un componente reutilizable que permite mostrar recibos HTML en un modal elegante. Ha sido diseñado para ser utilizado en diferentes partes de la aplicación Minitoys.

## Ubicación
```
src/app/shared/components/visor-recibo/
├── visor-recibo.component.ts
├── visor-recibo.component.html
└── visor-recibo.component.css
```

## Características
- ✅ Modal responsive con estilos adaptables
- ✅ Estados de loading, error y contenido
- ✅ Funcionalidad de impresión integrada
- ✅ Gestión automática del estado del recibo
- ✅ Fácil integración en cualquier componente

## Propiedades (Inputs)

### `isVisible: boolean`
Controla la visibilidad del modal.
```typescript
[isVisible]="mostrarModal"
```

### `ventaId: number | null`
ID de la venta para cargar el recibo automáticamente.
```typescript
[ventaId]="idVenta"
```

## Eventos (Outputs)

### `onClose: void`
Se emite cuando el usuario cierra el modal.
```typescript
(onClose)="cerrarModal()"
```

## Servicios Utilizados

### CajaDiariaStateService
El componente se conecta automáticamente con el `CajaDiariaStateService` para:
- Cargar el contenido HTML del recibo
- Gestionar estados de loading y error
- Limpiar el recibo al cerrar

## Ejemplo de Uso

### 1. Importar el Componente

```typescript
import { VisorReciboComponent } from '../../../shared/components/visor-recibo/visor-recibo.component';

@Component({
  // ...
  imports: [
    // ...otras importaciones
    VisorReciboComponent,
  ],
})
export class MiComponente {
  mostrarVisor = false;
  ventaSeleccionada: number | null = null;

  verRecibo(ventaId: number) {
    this.ventaSeleccionada = ventaId;
    this.mostrarVisor = true;
  }

  cerrarVisor() {
    this.mostrarVisor = false;
    this.ventaSeleccionada = null;
  }
}
```

### 2. Uso en el Template

```html
<!-- Botón para abrir el visor -->
<button (click)="verRecibo(123)">
  <i class="fas fa-receipt"></i> Ver Recibo
</button>

<!-- Componente visor de recibo -->
<app-visor-recibo 
  [isVisible]="mostrarVisor"
  [ventaId]="ventaSeleccionada"
  (onClose)="cerrarVisor()">
</app-visor-recibo>
```

## Ejemplos Implementados

### 1. Módulo de Reportes
```typescript
// src/app/users/features/reportes/reportes.component.ts
verRecibo(venta: VentaDetallada) {
  this.ventaIdActual.set(venta.id || 1);
  this.mostrarVisorRecibo.set(true);
}
```

### 2. Módulo de Ventas
```typescript
// src/app/users/features/ventas/ventas.component.ts

// Método para mostrar recibo manualmente
verRecibo(ventaId: number) {
  this.ventaIdParaRecibo = ventaId;
  this.mostrarVisorRecibo = true;
}

// Método para mostrar recibo automáticamente después de completar venta
mostrarReciboPostVenta(ventaId: number) {
  this.ventaIdParaRecibo = ventaId;
  this.mostrarVisorRecibo = true;
}
```

## Estados del Componente

### Loading
Muestra un spinner mientras se carga el recibo:
```html
<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
<p>Cargando recibo...</p>
```

### Contenido
Renderiza el HTML del recibo con estilos aplicados:
```html
<div class="recibo-content" [innerHTML]="reciboHtml()"></div>
```

### Error
Muestra un mensaje de error si no se puede cargar:
```html
<i class="fas fa-exclamation-triangle text-red-300"></i>
<h3>Error al cargar el recibo</h3>
```

### Generando PDF
Estado de loading mientras se genera el PDF:
```html
<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
Generando PDF...
```

## Funcionalidades

### Generación de PDF
El componente incluye un botón "Generar PDF" que:
- Utiliza el endpoint `/recibo/pdf/{ventaId}` para generar el PDF
- Abre el PDF en una nueva pestaña del navegador
- Muestra estados de loading mientras se procesa
- Maneja errores y bloqueadores de pop-ups
- Incluye validación del ID de venta

### Cierre del Modal
- Click en el botón X
- Click en el overlay (fondo del modal)
- Evento personalizado `onClose`

## Estilos CSS

### Responsive Design
- Adaptable a diferentes tamaños de pantalla
- Modal que ocupa hasta 4xl de ancho
- Altura máxima del 90% del viewport

### Estilos de Impresión
```css
@media print {
  .recibo-content {
    font-size: 12px;
    margin: 0;
    padding: 0;
  }
}
```

## Dependencias
- `CommonModule` de Angular
- `HttpClient` de Angular para llamadas HTTP
- `CajaDiariaStateService` para gestión de estado
- Font Awesome para iconos
- `environment` para configuración de URLs

## Ventajas del Componente Reutilizable

1. **Consistencia**: Misma experiencia en toda la aplicación
2. **Mantenibilidad**: Cambios centralizados en un solo lugar
3. **Reutilización**: Fácil de implementar en nuevos módulos
4. **Escalabilidad**: Preparado para futuras funcionalidades
5. **Separación de responsabilidades**: Lógica del visor separada de la lógica de negocio

## Posibles Extensiones Futuras

1. **Múltiples tipos de recibo**: Soporte para diferentes formatos
2. **Configuración personalizable**: Títulos, estilos, acciones personalizables
3. **Descarga de PDF**: Integración con bibliotecas de generación de PDF
4. **Previsualización**: Modo preview antes de imprimir
5. **Historiales**: Mantener un historial de recibos visualizados
6. **Envío por email**: Opción para enviar el recibo por correo electrónico
7. **Compartir en redes sociales**: Funcionalidad de compartir comprobantes

## Casos de Uso Implementados

### 1. **Visualización Manual de Recibos**
- Usuario hace clic en "Ver Recibo" desde reportes o lista de ventas
- Se abre el modal con el contenido del recibo
- Usuario puede imprimir o generar PDF

### 2. **Visualización Automática Post-Venta**
- Después de completar una venta exitosamente
- El sistema automáticamente muestra el recibo
- Permite impresión inmediata para el cliente
- Mejora la experiencia del usuario en punto de venta

## Notas Técnicas

- El componente utiliza Angular Signals para gestión reactiva del estado
- Implementa ViewEncapsulation.None para permitir estilos CSS globales
- Gestiona automáticamente la carga y limpieza del recibo
- Compatible con Angular 17+ (control flow syntax)
