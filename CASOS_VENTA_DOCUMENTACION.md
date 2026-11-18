# Documentación de Casos de Venta

## 📋 Casos Implementados para Sistema de Ventas

### **Casos para Productos**

#### **Caso 1: Venta Directa de Productos**
- **Descripción**: Pago completo inmediato con entrega
- **Parámetros API**:
  - `pago = total`
  - `recogido = true` 
  - `idFormaPago = seleccionada por cliente`
- **Uso**: `crearVentaUnificada(..., esVentaDirecta: true)`
- **Mensaje**: "✅ Venta completada y pagada. Lista para entrega."

#### **Caso 2: Venta de Producto Pendiente (Sin Adelanto)**
- **Descripción**: Reserva sin pago inicial, cliente pagará después
- **Parámetros API**:
  - `pago = 0`
  - `recogido = false`
  - `idFormaPago = seleccionada por cliente` (para cuando complete el pago)
- **Uso**: `crearVentaUnificada(..., adelanto: 0)`
- **Mensaje**: "📝 Preventa registrada sin adelanto. Cliente pagará al recoger."

#### **Caso 3: Venta de Producto con Adelanto**
- **Descripción**: Pago parcial inicial, saldo pendiente
- **Parámetros API**:
  - `pago = adelanto`
  - `recogido = false`
  - `idFormaPago = seleccionada por cliente`
- **Uso**: `crearVentaUnificada(..., adelanto: monto_parcial)`
- **Mensaje**: "💰 Preventa registrada con adelanto de X Bs. Saldo pendiente: Y Bs."

---

### **Casos para Marcos/Cuadros**

#### **Caso 4: Reserva de Marco Sin Adelanto**
- **Descripción**: Pedido personalizado sin pago inicial
- **Parámetros API**:
  - `pago = 0`
  - `recogido = false`
  - `idFormaPago = seleccionada por cliente` (para cuando complete el pago)
  - `fecha_entrega = especificada`
- **Uso**: `crearVentaMarco(..., adelanto: 0)`
- **Mensaje**: "📝 Pedido de marco registrado sin adelanto. El cliente pagará al recoger."

#### **Caso 5: Reserva de Marco con Adelanto**
- **Descripción**: Pedido personalizado con pago parcial inicial
- **Parámetros API**:
  - `pago = adelanto`
  - `recogido = false`
  - `idFormaPago = seleccionada por cliente`
  - `fecha_entrega = especificada`
- **Uso**: `crearVentaMarco(..., adelanto: monto_parcial)`
- **Mensaje**: "💰 Pedido de marco registrado con adelanto de X Bs. Saldo pendiente: Y Bs."

#### **Caso 6: Venta Directa de Marco**
- **Descripción**: Marco completado con pago total inmediato
- **Parámetros API**:
  - `pago = total`
  - `recogido = true`
  - `idFormaPago = seleccionada por cliente`
- **Uso**: `crearVentaMarco(..., esVentaDirecta: true)`
- **Mensaje**: "✅ Venta de marco completada y pagada. Lista para entrega."

---

## 🏗️ Arquitectura de Implementación

### **Servicios Principales**

1. **`VentaAdapterService`**
   - Determina automáticamente el tipo de venta
   - Mapea parámetros según casos de negocio
   - Valida datos y materiales

2. **`VentaOperationsService`**
   - `crearVentaUnificada()`: Para productos
   - `crearVentaMarco()`: Para marcos/cuadros
   - Ejecuta lógica de negocio unificada

3. **`VentasComponentOperationsService`**
   - Integra con componentes UI
   - Maneja callbacks y estados
   - Muestra mensajes contextuales

### **Flujo de Datos**

```
Componente UI
    ↓
VentasComponentOperationsService  
    ↓
VentaOperationsService
    ↓
VentaAdapterService → determinarParametrosVenta()
    ↓
API Backend (/ventaProductoMarco)
```

### **Determinación Automática de Tipos**

El sistema determina automáticamente el tipo basado en:

```typescript
if (montoAdelantado === 0) {
  tipoVenta = esMarco ? 'marco_sin_adelanto' : 'preventa_sin_adelanto';
} else if (montoAdelantado >= total && total > 0) {
  tipoVenta = 'directa'; // Pago completo
} else {
  tipoVenta = esMarco ? 'marco_con_adelanto' : 'preventa_con_adelanto';
}
```

---

## 🔧 Uso en Componentes

### **Para Productos (ventas.component.ts)**
```typescript
// Caso 1: Venta directa
await this.ventaOperationsService.crearVentaUnificada(
  items, clienteId, sucursalId, formaPagoId, usuarioId, 
  total, total, true // esVentaDirecta = true
);

// Caso 2: Sin adelanto
await this.ventaOperationsService.crearVentaUnificada(
  items, clienteId, sucursalId, formaPagoId, usuarioId, 
  total, 0, false // adelanto = 0
);

// Caso 3: Con adelanto
await this.ventaOperationsService.crearVentaUnificada(
  items, clienteId, sucursalId, formaPagoId, usuarioId, 
  total, adelanto, false
);
```

### **Para Marcos (cuadros.component.ts)**
```typescript
// Caso 4: Marco sin adelanto
await this.ventaOperationsService.crearVentaMarco(
  clienteId, sucursalId, formaPagoId, usuarioId,
  productoId, ancho, alto, cantidad, materiales,
  total, 0, false // adelanto = 0
);

// Caso 5: Marco con adelanto  
await this.ventaOperationsService.crearVentaMarco(
  clienteId, sucursalId, formaPagoId, usuarioId,
  productoId, ancho, alto, cantidad, materiales,
  total, adelanto, false
);

// Caso 6: Marco venta directa
await this.ventaOperationsService.crearVentaMarco(
  clienteId, sucursalId, formaPagoId, usuarioId,
  productoId, ancho, alto, cantidad, materiales,
  total, total, true // esVentaDirecta = true
);
```

---

## ✅ Validaciones Implementadas

- ✅ Validación automática de parámetros según tipo
- ✅ Mensajes contextuales por caso
- ✅ Manejo de errores específicos  
- ✅ Compatibilidad con API `/ventaProductoMarco`
- ✅ Soporte para `forma_pago_id = 0` (sin forma de pago)
- ✅ Estados correctos: `pago`, `recogido`, `entregado`

---

## 🧪 Testing

Para probar cada caso:

1. **Productos**: Usar componente ventas con diferentes valores de adelanto
2. **Marcos**: Usar componente cuadros con diferentes configuraciones  
3. **Verificar**: API calls en DevTools con parámetros correctos
4. **Confirmar**: Mensajes de éxito apropiados por caso

El sistema maneja automáticamente todos los casos sin necesidad de lógica manual en los componentes.