# 📦 Minitoys - Sistema de Gestión de Inventarios

<div align="center">
  
![Minitoys Logo](https://via.placeholder.com/200x80/FF6B35/FFFFFF?text=Minitoys)

[![Version](https://img.shields.io/badge/version-1.7.10-blue.svg)](https://github.com/merakisystem/minitoys/releases)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE.md)
[![Angular](https://img.shields.io/badge/Angular-19+-red.svg)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

**Sistema integral de gestión de inventarios especializado en tiendas de marcos y productos relacionados**

[📋 Características](#características) • [🚀 Instalación](#instalación) • [📖 Documentación](#documentación) • [🔄 Historial](#historial-de-versiones)

</div>

---

## 🎯 Visión General

Minitoys IMS es una solución empresarial completa diseñada específicamente para la gestión avanzada de inventarios en tiendas de marcos, cuadros y productos relacionados. El sistema proporciona un control detallado de materias primas, productos terminados y movimientos de stock a través de múltiples ubicaciones.

### 🌟 Características Principales

**Control Total de Inventario**: Seguimiento en tiempo real de stock con alertas automáticas de niveles mínimos y gestión de múltiples ubicaciones.

**Gestión Avanzada de Materiales**: Soporte completo para diversos tipos de materiales (varillas, trupan, vidrio, contornos) con cálculos automáticos de precios y factores de desperdicio.

**Interface Moderna**: Diseño responsivo y intuitivo construido con las últimas tecnologías web para una experiencia de usuario superior.

### 📊 Módulo de Reportes Avanzado (Nuevo en v1.4.10)

**Reportes de Caja Diaria**: Sistema completo de reportes con visualización de ventas diarias, resumen de caja y visor de recibos HTML integrado.

**Arquitectura Signal-Based**: Estado reactivo con `signalSlice` para actualizaciones en tiempo real y mejor performance.

**Visor de Recibos HTML**: Modal interactivo para visualizar e imprimir recibos directamente desde la tabla de ventas, con manejo de estados de loading y error.

**APIs Especializadas**: Integración con endpoints dedicados (`/ventas/detallado`, `/recibo/html/{id}`) para datos completos y actualizados.

## 🚀 Últimas Actualizaciones (v1.4.13)

### 🎯 Optimización del Sistema de Selección de Productos en Ventas
- **Datalist Personalizado**: Reemplazo completo de ng-select por componente nativo HTML5 con CSS personalizado
- **Compatibilidad Total**: Solución definitiva para problemas de ng-select en Chrome y Firefox
- **Validación Avanzada**: Sistema robusto que previene selección de productos inválidos
- **UX Mejorada**: Click en input vacío muestra toda la lista de productos disponibles

### 🔧 Refactorización del Componente de Ventas
- **Eliminación de ng-select**: Removal completo de dependencia problemática de ng-select
- **Dropdown Personalizado**: Implementación de dropdown nativo con:
  - Búsqueda en tiempo real por descripción y precio
  - Visualización rica con precio y stock por producto
  - Validación automática de productos válidos
  - Limpieza automática de selecciones inválidas
- **CSS Profesional**: Estilos personalizados que replican la apariencia de ng-select
- **Performance Optimizada**: Sin dependencias externas problemáticas

### 📊 Mejoras en Validación de Productos
- **Validación Estricta**: Solo permite agregar productos válidos seleccionados de la lista
- **Feedback Visual**: Indicadores claros cuando el texto no corresponde a un producto válido
- **Limpieza Automática**: Reset automático de selecciones al borrar el input
- **Estados Reactivos**: Botón "Agregar" se habilita solo con productos válidos seleccionados

### ⚡ Optimizaciones de Compatibilidad Browser
- **Chrome Compatible**: Funcionalidad completa sin problemas de renderizado
- **Firefox Optimizado**: Solución a problemas con DevTools abierto
- **Edge/Safari Ready**: Compatibilidad total con todos los navegadores modernos
- **Responsive Design**: Funcionalidad consistente en móvil y desktop

### 🎨 Mejoras de UI/UX para Selección de Productos
- **Lista Completa en Click**: Al hacer click en campo vacío muestra todos los productos disponibles
- **Búsqueda Inteligente**: Filtrado por descripción y precio en tiempo real
- **Información Rica**: Cada opción muestra descripción, precio y stock disponible
- **Eliminación de Errores**: Sin más mensajes "No se encontraron productos" innecesarios

### 🏗️ Arquitectura Simplificada
- **Componente Nativo**: Uso de input+datalist HTML5 con mejoras JavaScript
- **Sin Dependencias**: Eliminación de ng-select reduce bundle size y problemas
- **Código Limpio**: TypeScript puro sin wrappers de librerías externas
- **Mantenibilidad**: Código más simple y fácil de mantener

### 🔍 Nuevos Métodos Implementados
- **onProductSearch()**: Búsqueda en tiempo real con filtrado inteligente
- **onInputFocus()**: Manejo de foco para mostrar lista completa
- **onInputClick()**: Click en vacío muestra productos disponibles
- **selectProduct()**: Selección limpia de productos con validación
- **displayAllProducts()**: Visualización de primeros 10 productos

### 🎯 Resumen de Mejoras v1.4.13
Esta versión elimina completamente los problemas de ng-select con:
- **Componente nativo HTML5** con funcionalidad completa
- **Compatibilidad universal** con todos los navegadores
- **Validación robusta** que previene errores de selección
- **Performance mejorada** sin dependencias problemáticas
- **Código mantenible** con TypeScript puro
- **UX optimizada** con feedback visual inmediato

## 🚀 Versiones Anteriores Destacadas (v1.4.12)

### 🎯 Optimización del Sistema de Materiales Seleccionados
- **Sistema Simplificado**: Eliminación de computed signals complejos por arrays simples y directos
- **Mejor Performance**: Reducción significativa de cálculos reactivos que causaban paralización
- **Visualización Confiable**: Reemplazo de `cuadroCalculos()` por objeto `calculos` directo
- **Recálculo Manual**: Método `recalcular()` que se ejecuta solo cuando es necesario

### 🎯 Optimización del Sistema de Materiales Seleccionados (v1.4.12)
- **Sistema Simplificado**: Eliminación de computed signals complejos por arrays simples y directos
- **Mejor Performance**: Reducción significativa de cálculos reactivos que causaban paralización
- **Visualización Confiable**: Reemplazo de `cuadroCalculos()` por objeto `calculos` directo
- **Recálculo Manual**: Método `recalcular()` que se ejecuta solo cuando es necesario
- **Componente de Cliente**: Sistema completo de gestión de clientes con CRUD integrado
- **Componente de Cierres de Caja**: Módulo especializado para gestión de cierres de caja diarios

## 📊 Funcionalidades Clave del Sistema

### 🛠️ Gestión de Inventario Avanzada
- **Control Multi-Material**: Soporte completo para varillas, trupan, vidrio, contornos y productos terminados
- **Cálculos Automáticos**: Precios por metro/área con factores de desperdicio configurables
- **Alertas de Stock**: Sistema inteligente de alertas con 3 niveles de prioridad
- **Gestión Multi-Sucursal**: Control de inventario por ubicaciones múltiples

### 💰 Sistema de Ventas Completo
- **Preventas Inteligentes**: Gestión completa de preventas con filtrado y paginación dinámica
- **Múltiples Métodos de Pago**: Efectivo, tarjeta, transferencia y preventas
- **Validación de Stock**: Control en tiempo real de disponibilidad vs carrito
- **Cálculos Automáticos**: Subtotales, descuentos y totales con validación API

### 📊 Reportes y Analytics
- **Caja Diaria Signal-Based**: Reportes reactivos con estado en tiempo real
- **Visor de Recibos HTML**: Modal interactivo para visualizar e imprimir recibos
- **Dashboard Ejecutivo**: Métricas de ventas, stock crítico y preventas pendientes
- **APIs Especializadas**: Endpoints dedicados para datos completos y actualizados

## ⚙️ Especificaciones Técnicas

### 🎨 Stack Tecnológico
- **Frontend**: Angular 19+ con Standalone Components
- **Lenguaje**: TypeScript 5.0+ con tipado estricto
- **Estilos**: TailwindCSS con sistema de diseño personalizado
- **Estado**: Signal-based State Management (ngxtension/signalSlice)
- **Formularios**: Reactive Forms con validación avanzada
- **Iconos**: Font Awesome 6.x

### 🏗️ Arquitectura del Sistema
```
Minitoys IMS v1.4.13
├── � Frontend (Angular)
│   ├── Admin Module (Categorías, lugares, usuarios)
│   ├── Users Module 
│   │   ├── Inventario (Control de stock)
│   │   ├── Ventas (Sistema optimizado sin ng-select)
│   │   ├── Clientes (CRM integrado)
│   │   ├── Reportes (Signal-based + Visor HTML)
│   │   ├── Cuadros (Materiales optimizados)
│   │   └── Dashboard (Analytics en tiempo real)
│   └── Shared Components (UI reutilizable)
├── 🔌 API Layer (RESTful)
├── 🗄️ Base de Datos (Relacional)
└── 🖼️ Storage (Gestión de archivos)
```

### � Seguridad y Performance
- **Autenticación**: Control basado en roles y permisos
- **Validación**: Cliente y servidor con tipado estricto
- **CORS**: Configuración optimizada para desarrollo y producción
- **Bundle Optimization**: Reducción de dependencias problemáticas (ng-select eliminado)

## 🚀 Instalación y Configuración

### 📋 Prerrequisitos
- **Node.js** `18.x` o superior
- **npm** `9.x` o superior  
- **Angular CLI** `17.x` o superior

### ⚡ Instalación Rápida
```bash
# Clonar y configurar
git clone https://github.com/merakisystem/minitoys.git
cd minitoys
npm install

# Configurar entorno
cp src/environments/environment.example.ts src/environments/environment.ts

# Iniciar desarrollo
npm start
```

## 🔄 Historial de Versiones Resumido

### � [v1.4.11-1.4.12] - Sistema de Preventas y Materiales
**Highlights**: Refactorización completa del sistema de preventas con paginado inteligente, optimización del módulo de cuadros eliminando computed signals complejos, implementación de componentes de cliente y cierres de caja.

### 📊 [v1.4.10] - Reportes Signal-Based  
**Highlights**: Arquitectura signal-based completa, visor de recibos HTML integrado, separación de servicios API/State, endpoints especializados para reportes.

### ⚠️ [v1.3.8-1.3.9] - Dashboard y Analytics
**Highlights**: Sistema inteligente de alertas de stock, gráfico de barras interactivo, integración de lista de pendientes en dashboard, métricas reactivas.

### 🔧 [v1.2.4-1.3.7] - Arquitectura en Capas
**Highlights**: Refactorización completa del módulo de ventas con arquitectura en capas, 8+ servicios especializados, sistema robusto de preventas, corrección de bugs críticos.

### �️ [v1.0.0-1.1.3] - Fundación del Sistema
**Highlights**: Lanzamiento inicial con gestión completa de inventario, módulos admin/users, sistema de autenticación, gestión de materias primas, componente de stock, mejoras de UX.

## � Cálculos y Algoritmos

### 🧮 Fórmulas de Precio Automático
```typescript
// Varillas (cálculo lineal)
precioVenta = (precioCompra / largo) * 100

// Trupan, Vidrio, Contorno (cálculo por área)
precioVenta = (precioCompra / (largo * alto)) * 10000

// Factores de desperdicio por material
const factores = {
  'varilla': 1.3,   // 30% desperdicio
  'trupan': 1.3,    // 30% desperdicio  
  'vidrio': 1.4,    // 40% desperdicio
  'contorno': 1.4   // 40% desperdicio
}
```

### 📊 Sistema de Alertas de Stock
```typescript
// Algoritmo de semáforo para alertas
- 🔴 Crítico: Stock ≤ (Stock Mínimo + 20%)
- 🟡 Advertencia: Stock ≤ (Stock Mínimo + 50%) 
- 🟢 Normal: Stock > (Stock Mínimo + 50%)
```

## 🔌 API Endpoints Principales

### � Gestión de Inventario
```
GET/POST/PUT/DELETE /api/materiaPrima{Trupan|Vidrio|Varilla|Contorno}
GET /api/materias-primas-paginado?page=1&perPage=10
GET /api/materias-primas-search?search=término
```

### 💰 Sistema de Ventas
```
GET /api/ventas/detallado?fecha=DD-MM-YY
GET /api/recibo/html/{id}
POST /api/caja/cierre
```

### 👥 Gestión de Clientes
```
GET/POST/PUT/DELETE /api/clientes
GET /api/caja/cierres
```

##  Próximas Versiones

### 🔮 v1.5.0 - En Desarrollo
- 📊 Reportes avanzados de ventas con filtros personalizables
- 🧾 Generación automática de facturas y recibos
- � Analytics detallados con gráficos interactivos
- 🔔 Notificaciones automáticas de preventas vencidas
- 📱 PWA support con sincronización offline

### � v1.6.0 - Planificado
- 🤖 Integración con sistemas de facturación electrónica
- 📦 Gestión avanzada de proveedores y órdenes de compra
- 🏷️ Sistema de códigos de barras y QR
- 💳 Integración con pasarelas de pago
- � Dashboard ejecutivo con KPIs avanzados

## 🔄 Historial Completo de Versiones

### 🎯 [v1.4.13] - 2025-07-30
**Optimización del Sistema de Selección de Productos en Ventas**

#### ✨ Mejoras Principales
- ✅ **Datalist Personalizado**: Reemplazo completo de ng-select por componente nativo HTML5
- ✅ **Compatibilidad Universal**: Solución definitiva para problemas en Chrome y Firefox
- ✅ **Validación Avanzada**: Sistema que previene selección de productos inválidos
- ✅ **UX Mejorada**: Click en input vacío muestra toda la lista disponible

#### 🔧 Refactorización Técnica
- ✅ **Eliminación de ng-select**: Removal completo de dependencia problemática
- ✅ **Dropdown Personalizado**: Implementación nativa con búsqueda en tiempo real
- ✅ **CSS Profesional**: Estilos que replican apariencia de ng-select
- ✅ **Performance Optimizada**: Sin dependencias externas problemáticas

#### 🏗️ Nuevos Métodos
- ✅ **onProductSearch()**: Búsqueda inteligente con filtrado
- ✅ **onInputFocus()/onInputClick()**: Manejo de eventos de foco y click
- ✅ **selectProduct()**: Selección limpia con validación
- ✅ **displayAllProducts()**: Visualización de productos disponibles

### 🎯 [v1.4.12] - 2025-07-18

### 🧮 Fórmulas de Precio Automático

#### Materias Primas por Dimensión
```typescript
// Varillas (cálculo lineal)
precioVenta = (precioCompra / largo) * 100

// Trupan, Vidrio, Contorno (cálculo por área)
precioVenta = (precioCompra / (largo * alto)) * 10000
```

#### Factores de Desperdicio por Material
```typescript
const factoresDesperdicio = {
  'varilla': 1.3,   // 30% de desperdicio
  'trupan': 1.3,    // 30% de desperdicio  
  'vidrio': 1.4,    // 40% de desperdicio
  'contorno': 1.4   // 40% de desperdicio
}
```

### 📊 Indicadores de Stock

El sistema utiliza un algoritmo de semáforo para alertas de stock:

- 🔴 **Crítico**: Stock ≤ (Stock Mínimo + 20%)
- 🟡 **Advertencia**: Stock ≤ (Stock Mínimo + 50%) 
- 🟢 **Normal**: Stock > (Stock Mínimo + 50%)

## 🔄 Historial de Versiones

### 🎯 [v1.4.13] - 2025-07-30
**Optimización del Sistema de Selección de Productos en Ventas**

#### ✨ Mejoras Principales
- ✅ **Datalist Personalizado**: Reemplazo completo de ng-select por componente nativo HTML5
- ✅ **Compatibilidad Universal**: Solución definitiva para problemas en Chrome y Firefox
- ✅ **Validación Avanzada**: Sistema que previene selección de productos inválidos
- ✅ **UX Mejorada**: Click en input vacío muestra toda la lista disponible

#### 🔧 Refactorización Técnica
- ✅ **Eliminación de ng-select**: Removal completo de dependencia problemática
- ✅ **Dropdown Personalizado**: Implementación nativa con búsqueda en tiempo real
- ✅ **CSS Profesional**: Estilos que replican apariencia de ng-select
- ✅ **Performance Optimizada**: Sin dependencias externas problemáticas

#### 🏗️ Nuevos Métodos
- ✅ **onProductSearch()**: Búsqueda inteligente con filtrado
- ✅ **onInputFocus()/onInputClick()**: Manejo de eventos de foco y click
- ✅ **selectProduct()**: Selección limpia con validación
- ✅ **displayAllProducts()**: Visualización de productos disponibles

#### 🐛 Correcciones Críticas
- ✅ **Bug de Validación**: Input vacío ya no permite agregar items inválidos
- ✅ **Compatibilidad Cross-Browser**: Funciona perfectamente en todos los navegadores
- ✅ **Performance**: Eliminación de problemas de renderizado en listas grandes
- ✅ **UX**: Comportamiento consistente entre click y focus en input

### 🎯 [v1.4.12] - 2025-07-18
**Optimización del Sistema de Materiales Seleccionados**

#### ✨ Mejoras Principales
- ✅ **Sistema Simplificado**: Eliminación de computed signals complejos por arrays simples
- ✅ **Mejor Performance**: Reducción significativa de cálculos reactivos que causaban paralización
- ✅ **Visualización Confiable**: Reemplazo de `cuadroCalculos()` por objeto `calculos` directo
- ✅ **Recálculo Manual**: Método `recalcular()` que se ejecuta solo cuando es necesario

#### 🔧 Refactorización Técnica
- ✅ **Eliminación de Computed Signals**: Removal de `cuadroCalculos = computed(...)` por objeto simple
- ✅ **Método `recalcular()`**: Función manual que actualiza cálculos cuando hay cambios
- ✅ **Triggers Optimizados**: Recálculo automático al seleccionar/eliminar materiales y cambiar formulario
- ✅ **HTML Simplificado**: Template usa `calculos.propiedad` en lugar de `cuadroCalculos().propiedad`

#### 📊 Mejoras en Visualización
- ✅ **Sección "Material Seleccionado"**: Visualización correcta de materiales seleccionados
- ✅ **Cálculos Precisos**: Medidas y subtotales calculados correctamente según tipo de material
- ✅ **Información Rica**: Muestra tipo, descripción, medidas, precio y subtotal de cada material
- ✅ **Eliminación Funcional**: Botón X funcional para remover materiales seleccionados

#### 🧑‍💼 Nuevos Componentes Desarrollados
- ✅ **Componente de Cliente**: Sistema completo de gestión de clientes con CRUD integrado
- ✅ **Componente de Cierres de Caja**: Módulo especializado para gestión de cierres de caja diarios
- ✅ **Integración Seamless**: Ambos componentes integrados perfectamente con el sistema existente
- ✅ **Validación Avanzada**: Formularios con validación en tiempo real y manejo de errores
- ✅ **Estados Reactivos**: Uso de signals para actualización automática de datos
- ✅ **UI/UX Consistente**: Diseño coherente con el resto del sistema

#### ⚡ Optimizaciones de Performance
- ✅ **Sin Paralización**: Eliminación de bucles infinitos en computed signals
- ✅ **Cálculos Eficientes**: Solo recalcula cuando realmente hay cambios
- ✅ **Memoria Optimizada**: Mejor gestión de memoria sin computed signals pesados
- ✅ **Renderizado Fluido**: UI más responsiva sin bloqueos en cálculos

#### 🏗️ Arquitectura Mejorada
- ✅ **Objeto `calculos`**: Estructura simple para almacenar todos los cálculos
- ✅ **Método `recalcular()`**: Función pura que actualiza el objeto calculos
- ✅ **Triggers Explícitos**: Llamadas manuales a recalcular() en momentos específicos
- ✅ **Estado Predecible**: Comportamiento consistente sin efectos secundarios

### 🎯 [v1.4.11] - 2025-07-17
**Refactorización Completa del Sistema de Preventas**

#### ✨ Nuevas Características
- ✅ **Filtrado Preciso de Preventas**: Solo items con `recogido === false`
- ✅ **Paginado Dinámico Inteligente**: Máximo 3 páginas con cálculo automático
- ✅ **Formato de Fecha Simplificado**: Texto exacto del API sin conversiones
- ✅ **Arquitectura Backend-First**: Ordenamiento trasladado al backend

#### 🔧 Optimizaciones
- ⚡ **Performance Mejorada**: Eliminación de lógica de ordenamiento frontend
- 🧹 **Código Limpio**: Removal de todos los console.log de debugging
- 📱 **UX Optimizada**: Lista de preventas con datos exactos y navegación eficiente
- 🏗️ **Arquitectura Simplificada**: Responsabilidades claras frontend/backend

#### 🛠️ Servicios Refactorizados
- `PendingItemsService`: Filtrado eficiente sin ordenamiento
- `PendingListComponent`: Formato de fecha directo del API
- `VentasComponent`: Paginado dinámico con configuración automática
- `VentasStateService`: Optimizado para orden del backend

### 📊 [v1.4.10] - 2025-07-16
**Refactorización del Módulo de Reportes con Arquitectura Signal-Based**

#### ✨ Nuevas Características
- ✅ **Arquitectura Signal-Based**: Implementación completa de signals y signalSlice para manejo reactivo de estado
- ✅ **Separación de Servicios**: 
  - `CajaDiariaService`: Manejo exclusivo de llamadas HTTP con tipado estricto
  - `CajaDiariaStateService`: State management reactivo con signals y RxJS subjects
- ✅ **Visor de Recibos HTML**: Modal interactivo para visualizar e imprimir recibos
- ✅ **API Mejorada**: Integración con endpoint `/ventas/detallado?fecha=DD-MM-YY`
- ✅ **Estados de Loading**: Manejo granular de estados (idle, loading, success, error)

#### 📄 Visor de Recibos Integrado
- ✅ **Modal Responsivo**: Fullscreen para móviles con estados de loading y error
- ✅ **Funcionalidad de Impresión**: Botón de impresión integrado en el modal
- ✅ **API de Recibos**: Endpoint `/recibo/html/{id}` para contenido HTML
- ✅ **UX Optimizada**: Botones claros (Cerrar, Imprimir) con iconografía Font Awesome

#### ⚡ Mejoras de Performance y Código
- ✅ **Datos en Tiempo Real**: Eliminación completa de datos hardcodeados
- ✅ **Interfaces Tipadas**: `VentaDetallada`, `ResumenCaja`, `VentasDelDiaResponse`
- ✅ **Código Limpio**: Refactorización y eliminación de código legacy
- ✅ **CSS Optimizado**: Estilos específicos para recibos y modales responsive
- ✅ **Error Handling**: Manejo robusto con feedback visual al usuario

#### 🏗️ Arquitectura Técnica
- ✅ **Signal State Management**: Migración completa a architecture signal-based
- ✅ **Servicios Modulares**: Separación clara entre API calls y state management
- ✅ **TypeScript Strict**: Tipado estricto en todas las interfaces y servicios
- ✅ **RxJS + Signals**: Combinación de subjects y signals para reactividad óptima

#### 📋 Interfaces y Modelos Nuevos
```typescript
interface VentaDetallada {
  id?: number;
  hora: string;
  cliente: string;
  productos: string;
  total: number;
  estado: string;
}

interface VentasDelDiaResponse {
  fecha_consultada: string;
  ventas: VentaDetallada[];
}

interface ResumenCaja {
  fechaCierre: string;
  totalVentas: number;
  totalEfectivo: number;
  totalTarjeta: number;
  totalTransferencia: number;
  numeroVentas: number;
  ventasPendientes: number;
}
```

#### 🚀 Impacto y Beneficios
- ✅ **Mejor Performance**: Renderizado optimizado con signals reactivos
- ✅ **Mantenibilidad**: Código más limpio y modular
- ✅ **Experiencia de Usuario**: Interfaces más fluidas y responsivas
- ✅ **Escalabilidad**: Arquitectura preparada para futuras funcionalidades

### 📊 [v1.3.9] - 2025-07-14
**Gráfico de Barras Interactivo de Stock Crítico**

#### ✨ Nuevas Características
- ✅ **Stock Chart Service**: Nuevo servicio especializado para datos de gráficos de stock
- ✅ **Gráfico de Barras Real**: Visualización interactiva de stock por tipo de producto
- ✅ **Análisis por Tipo**: Datos separados para productos, varillas, contornos, trupán y vidrios
- ✅ **Comparación Visual**: Stock actual vs stock mínimo en barras paralelas
- ✅ **Tooltips Informativos**: Información detallada al pasar el mouse
- ✅ **Indicadores de Estado**: Señales visuales para stock crítico

#### 📊 Tipos de Productos Soportados
- ✅ **Productos**: Marcos y productos terminados
- ✅ **Varillas**: Rieles y materiales de marco
- ✅ **Contornos**: Elementos decorativos
- ✅ **Trupán**: Materiales de base MDF
- ✅ **Vidrios**: Cristales templados y comunes

#### 🎨 Visualización Avanzada
- ✅ **Barras Interactivas**: Efectos hover y tooltips descriptivos
- ✅ **Colores Diferenciados**: Azul para stock actual, naranja para mínimo
- ✅ **Escala Automática**: Ajuste dinámico según valores máximos
- ✅ **Responsive Design**: Adaptable a todos los tamaños de pantalla
- ✅ **Animaciones Suaves**: Transiciones fluidas en hover y estados

#### 🧠 Lógica de Datos Implementada
- ✅ **Agregación por Tipo**: Suma automática de stock por categoría
- ✅ **Cálculo de Porcentajes**: Normalización para visualización
- ✅ **Detección de Stock Crítico**: Identificación automática de problemas
- ✅ **Estado Sin Datos**: Manejo elegante de inventario vacío

#### 🔧 Funcionalidades Avanzadas
- ✅ **Recomendaciones de Reabastecimiento**: Sugerencias automáticas de compra
- ✅ **Priorización de Restock**: Alta, media y baja prioridad
- ✅ **Estadísticas Resumidas**: Tipos críticos y porcentajes de completitud
- ✅ **Barras de Progreso**: Indicadores visuales de nivel de stock
- ✅ **Formateo Inteligente**: Números grandes mostrados como "K"

#### 🏗️ Arquitectura de Servicios
```typescript
export interface StockChartData {
  tipo: string;
  stockActual: number;
  stockMinimo: number;
  porcentajeActual: number;
  porcentajeMinimo: number;
  color: string;
  label: string;
}
```

#### 📱 Componentes Creados
- ✅ **StockChartService**: Servicio especializado para cálculos de gráficos
- ✅ **StockcriticoComponent**: Componente mejorado con gráfico real
- ✅ **Computed Signals**: Datos reactivos que se actualizan automáticamente
- ✅ **CSS Animations**: Estilos personalizados para interacciones

#### 🎯 Experiencia de Usuario
- ✅ **Visualización Inmediata**: Análisis de stock al instante
- ✅ **Información Contextual**: Datos específicos por tipo de producto
- ✅ **Recomendaciones Accionables**: Sugerencias claras de reabastecimiento
- ✅ **Interface Intuitiva**: Navegación y comprensión sencilla

### ⚠️ [v1.3.8] - 2025-07-14
**Sistema Inteligente de Alertas de Stock en Dashboard**

#### ✨ Nuevas Características
- ✅ **Stock Alerts Service**: Nuevo servicio especializado para manejo de alertas de stock
- ✅ **Alertas Reactivas**: Cálculo automático de alertas basado en inventario real
- ✅ **Priorización Inteligente**: Sistema de 3 niveles (crítica, media, baja)
- ✅ **Indicadores Visuales**: Colores dinámicos según prioridad de alertas
- ✅ **Información Detallada**: Mensajes descriptivos del estado del stock

#### 🧠 Lógica de Alertas Implementada
- ✅ **Stock Crítico**: Productos sin stock (0 unidades) o ≤25% del mínimo
- ✅ **Stock Medio**: Productos entre 25% y 50% del stock mínimo
- ✅ **Stock Bajo**: Productos entre 50% y 100% del stock mínimo
- ✅ **Filtrado Automático**: Solo productos con `stock_actual ≤ stock_minimo`
- ✅ **Ordenamiento**: Por prioridad y después por porcentaje de stock

#### 🎨 Mejoras Visuales del Dashboard
- ✅ **Colores Dinámicos**: 
  - 🔴 Rojo para alertas críticas
  - 🟠 Naranja para alertas medias/bajas
  - 🟢 Verde para stock normal
- ✅ **Iconos Contextuales**: Cambio automático según estado
- ✅ **Mensajes Informativos**: Desglose de alertas por prioridad
- ✅ **Indicadores de Estado**: Información adicional bajo el número

#### 🏗️ Arquitectura de Alertas
- ✅ **StockAlertsService**: Servicio especializado en cálculo de alertas
- ✅ **Computed Signals**: Valores reactivos que se actualizan automáticamente
- ✅ **Integration Layer**: Conexión con `InventarioStateService`
- ✅ **Interface StockAlert**: Tipado fuerte para datos de alertas

#### 📊 Tipos de Datos Implementados
```typescript
export interface StockAlert {
  id: number;
  codigo: string;
  descripcion: string;
  tipo: string;
  stockActual: number;
  stockMinimo: number;
  diferencia: number;
  porcentaje: number;
  prioridad: 'critica' | 'media' | 'baja';
}
```

#### 🔧 Métodos de Servicio
- ✅ **getStockAlerts()**: Obtiene todas las alertas calculadas
- ✅ **getStockAlertsCount()**: Número total de alertas
- ✅ **getCriticalAlerts()**: Solo alertas críticas
- ✅ **getAlertsByPriority()**: Desglose por prioridad
- ✅ **refreshInventoryData()**: Actualización manual de datos

#### 📱 Experiencia de Usuario
- ✅ **Información Inmediata**: Estado del stock visible al instante
- ✅ **Priorización Visual**: Fácil identificación de problemas críticos
- ✅ **Datos Actualizados**: Sincronización automática con inventario
- ✅ **Responsive Design**: Funciona en todos los dispositivos

#### 🔗 Integración con Sistema Existente
- ✅ **InventarioStateService**: Consume datos del estado de inventario
- ✅ **TodosInventario Interface**: Utiliza `stock_global_actual` y `stock_global_minimo`
- ✅ **ResumenventasComponent**: Integración en dashboard principal
- ✅ **Signal-based**: Arquitectura reactiva con Angular signals

### 📋 [v1.3.7] - 2025-07-14
**Integración del Sistema de Lista de Pendientes en Dashboard**

#### ✨ Nuevas Características
- ✅ **Pending List Component**: Integrado componente `pending-list` en el dashboard
- ✅ **Reemplazo de PendingOrders**: Sustituido `app-pendingorders` por `app-pending-list`
- ✅ **Datos Reactivos**: Conexión reactiva con `VentasStateService` usando signals
- ✅ **Gestión de Acciones**: Implementado manejo de acciones (completar, cancelar, ver)
- ✅ **Configuración Personalizada**: Config específica para dashboard (sin filtros, paginación reducida)

#### 🏗️ Arquitectura Implementada
- ✅ **Computed Signals**: Cálculo reactivo de pending items desde estado de ventas
- ✅ **Event Handling**: Manejo de clicks y acciones en items pendientes
- ✅ **Service Integration**: Uso de `PendingItemsService` para conversión de datos
- ✅ **State Management**: Integración directa con `VentasStateService`

#### 🎯 Funcionalidades del Dashboard
- ✅ **Lista Dinámica**: Items pendientes actualizados en tiempo real
- ✅ **Búsqueda Integrada**: Campo de búsqueda para filtrar pendientes
- ✅ **Acciones Directas**: Botones para completar, cancelar y ver detalles
- ✅ **Paginación Compacta**: 5 items por página para mejor UX en sidebar
- ✅ **Sin Filtros**: Interfaz simplificada para dashboard

#### 📱 Mejoras de UI
- ✅ **Right Sidebar**: Colocado en barra lateral derecha (w-80)
- ✅ **Responsive Design**: Oculto en móvil, visible en desktop (lg:block)
- ✅ **Padding Consistente**: Espaciado uniforme (p-6)
- ✅ **Scroll Independiente**: Overflow-y-auto para lista larga

#### 🔧 Componentes Modificados
- ✅ **DashboardComponent.ts**: Lógica reactiva e integración de servicios
- ✅ **DashboardComponent.html**: Template con pending-list component
- ✅ **Imports Actualizados**: Reemplazo de PendingordersComponent por PendingListComponent

#### 📊 Configuración Específica
```typescript
pendingConfig: PendingConfig = {
  title: 'Pedidos Pendientes',
  showFilters: false,     // Simplificado para dashboard
  showSearch: true,       // Búsqueda habilitada
  allowActions: true,     // Acciones habilitadas
  itemsPerPage: 5,        // Compacto para sidebar
  enablePagination: true  // Paginación habilitada
}
```

### 🔧 [v1.3.6] - 2025-07-14
**Corrección Crítica del Menú Móvil y Mejoras de UX**

#### 🐛 Correcciones Críticas
- ✅ **Menú Móvil Corregido**: Solucionado problema donde el botón X no cerraba el menú en vista móvil
- ✅ **Funcionalidad de Cierre**: Implementado cierre automático al hacer clic fuera del menú
- ✅ **Cierre por Navegación**: El menú se cierra automáticamente al hacer clic en cualquier enlace
- ✅ **Event Listeners**: Agregado manejo correcto de eventos para evitar memory leaks

#### 🎨 Mejoras de UI/UX
- ✅ **Animaciones Suaves**: Transiciones CSS mejoradas para abrir/cerrar menú (0.3s ease-in-out)
- ✅ **Overlay de Fondo**: Fondo semitransparente cuando el menú está abierto
- ✅ **Efectos Hover**: Animaciones sutiles en enlaces del menú móvil
- ✅ **RouterLink Activo**: Estados activos correctos para la navegación actual
- ✅ **Iconografía Mejorada**: Iconos específicos para cada sección admin

#### 🏗️ Mejoras Técnicas
- ✅ **Gestión de Estado**: Métodos separados para `toggleMenu()` y `closeMenu()`
- ✅ **Click Outside Handler**: Detección inteligente de clics fuera del menú
- ✅ **Memory Management**: Limpieza correcta de event listeners en `ngOnDestroy`
- ✅ **RouterLink Integration**: Reemplazo de enlaces estáticos por navegación Angular
- ✅ **Accesibilidad**: Focus states y outline para navegación por teclado

#### 📱 Responsividad
- ✅ **Vista Desktop**: Menú oculto correctamente en pantallas grandes (lg:hidden)
- ✅ **Vista Móvil**: Funcionalidad completa en dispositivos móviles y tablets
- ✅ **Scroll Personalizado**: Scrollbar estilizado para navegación larga
- ✅ **Z-index Optimizado**: Superposición correcta de elementos

#### 🔧 Archivos Modificados
- ✅ **HeaderComponent.ts**: Lógica completa de manejo del menú móvil
- ✅ **HeaderComponent.html**: Template con RouterLink y eventos de cierre
- ✅ **HeaderComponent.css**: Estilos completos para animaciones y estados

### 🔄 [v1.3.5] - 2025-07-12
**Implementación del Dashboard de Resumen de Ventas con Arquitectura Reactiva**

#### ✨ Nuevas Características
- ✅ **Dashboard de Resumen de Ventas**: Implementación completa del componente resumenventas en el dashboard
- ✅ **Visualización de Ventas Totales**: Mostrar total de ventas en tiempo real usando la arquitectura de capas
- ✅ **Conteo de Pedidos Pendientes**: Visualización dinámica del número de preventas activas
- ✅ **Integración con Estado de Ventas**: Conexión directa con VentasStateService para datos reactivos
- ✅ **Formateo Inteligente de Montos**: Formato automático de valores (K para miles, M para millones)

#### 🏗️ Mejoras de Arquitectura
- ✅ **Signals Reactivos**: Uso de Angular signals para datos reactivos en dashboard
- ✅ **Computed Values**: Valores calculados automáticamente basados en estado de ventas
- ✅ **Separación de Responsabilidades**: Dashboard consume servicios sin lógica de negocio
- ✅ **Reutilización de Servicios**: Aprovechamiento de servicios existentes del módulo de ventas

#### 📊 Nuevos Métodos en Servicios
- ✅ **VentasStateService.getVentasTotal()**: Obtener total de ventas actual
- ✅ **VentasStateService.getVentasTotalSignal()**: Signal reactivo para total de ventas
- ✅ **VentasStateService.getPreventasCount()**: Conteo de preventas activas
- ✅ **PendingItemsService.getPendingItemsCount()**: Conteo de elementos pendientes

#### 🎨 Mejoras de UI
- ✅ **Cards Responsivas**: Grid adaptativo para diferentes tamaños de pantalla
- ✅ **Iconografía Moderna**: Iconos FontAwesome para cada métrica
- ✅ **Colores Temáticos**: Esquema de colores consistente con el diseño general
- ✅ **Datos en Tiempo Real**: Actualización automática al cambiar el estado de ventas

### � [v1.2.4] - 2025-07-12
**Refactorización completa del módulo de ventas con arquitectura mejorada**

#### ✨ Nuevas Características
- ✅ **Sistema de Ventas Refactorizado**: Refactorización completa del módulo de ventas con arquitectura en capas
- ✅ **Gestión de Preventas**: Sistema completo de creación, carga y cancelación de preventas
- ✅ **Lista de Tareas Pendientes**: Implementación de lista de elementos pendientes con acciones y filtros
- ✅ **Información Completa de Cliente**: Visualización de nombre, apellido y teléfono en tareas pendientes
- ✅ **Ordenamiento Inteligente**: Ordenamiento automático de preventas por ID (más recientes primero)
- ✅ **Cálculos Automáticos**: Sistema robusto de cálculo de subtotales, descuentos y totales
- ✅ **Validación de Stock en Tiempo Real**: Control dinámico de stock disponible vs carrito
- ✅ **Gestión de Clientes Integrada**: Creación rápida de clientes desde el módulo de ventas

#### 🏗️ Arquitectura y Patrones de Diseño
- ✅ **Layered Architecture**: Implementación de arquitectura en capas (Presentation, Application, Domain, Infrastructure)
- ✅ **Service Layer Pattern**: Separación clara entre servicios de dominio y aplicación
- ✅ **Facade Pattern**: VentasComponentOperationsService como fachada para operaciones complejas
- ✅ **Strategy Pattern**: Diferentes estrategias para completar vs crear preventas
- ✅ **Single Responsibility Principle**: Cada servicio con una responsabilidad específica
- ✅ **Dependency Injection**: Inyección de dependencias optimizada con Angular inject()

#### 🔧 Servicios Especializados Creados
- ✅ **VentaFormService**: Manejo de formularios, validaciones y cálculos base
- ✅ **PendingItemsService**: Conversión y gestión de elementos pendientes
- ✅ **VentaOperationsService**: Operaciones CRUD de ventas (capa de dominio)
- ✅ **VentasComponentOperationsService**: Orquestación de operaciones para UI (capa de aplicación)
- ✅ **ClienteOperationsService**: Operaciones específicas de clientes en ventas
- ✅ **VentasUIService**: Manejo de eventos y acciones de interfaz
- ✅ **VentasFormHandlerService**: Procesamiento de eventos de formulario
- ✅ **VentasStateManagerService**: Gestión de estado local del componente

#### 🐛 Correcciones Críticas
- ✅ **Bug de Subtotal**: Corregido problema donde el subtotal no se actualizaba al agregar el primer elemento
- ✅ **Cálculo de Totales**: Implementación robusta de cálculos con validación de totales en API
- ✅ **Sincronización de Estado**: Mejora en la sincronización entre formulario y estado del carrito
- ✅ **Actualización de Stock**: Corrección en actualización de stock disponible en tiempo real
- ✅ **Gestión de Preventas**: Fix en carga y gestión de preventas existentes

#### 🎨 Mejoras de UI/UX
- ✅ **Lista de Pendientes Optimizada**: Filtros simplificados manteniendo solo búsqueda y acciones
- ✅ **Información Rica**: Mostrado de datos completos del cliente en lugar de solo ID
- ✅ **Feedback Visual**: Indicadores de estado mejorados para procesamiento de ventas
- ✅ **Navegación Fluida**: Transiciones suaves entre estados de venta y preventa
- ✅ **Validación en Tiempo Real**: Validación instantánea de formularios con mensajes claros

#### 🔍 Gestión de Estado Mejorada
- ✅ **Signal-based State**: Uso completo de Angular Signals para reactividad
- ✅ **Estado Sincronizado**: Sincronización automática entre todos los servicios
- ✅ **Persistencia Local**: Guardado automático de items en localStorage
- ✅ **Limpieza de Estado**: Gestión apropiada de limpieza al completar operaciones
- ✅ **Estado de Procesamiento**: Control granular de estados de carga y procesamiento

#### 📊 Funcionalidades de Negocio
- ✅ **Múltiples Métodos de Pago**: Soporte para efectivo, tarjeta, transferencia y preventa
- ✅ **Gestión de Descuentos**: Aplicación dinámica de descuentos con recálculo automático
- ✅ **Adelantos y Saldos**: Manejo completo de pagos por adelantado y saldos pendientes
- ✅ **Control de Stock**: Validación estricta de stock disponible vs cantidad en carrito
- ✅ **Historial de Preventas**: Seguimiento completo de preventas con acciones disponibles

#### 🚀 Performance y Optimización
- ✅ **Código Modular**: Todos los archivos mantenidos bajo 300 líneas para mejor mantenibilidad
- ✅ **Lazy Loading**: Servicios cargados bajo demanda
- ✅ **Optimización de Renders**: Reducción de re-renders innecesarios
- ✅ **Gestión de Memoria**: Prevención de memory leaks con proper cleanup
- ✅ **Cacheo Inteligente**: Cacheo de datos de clientes y productos

#### 📋 Interfaces y Tipado
- ✅ **ItemVenta Interface**: Interface robusta para elementos del carrito
- ✅ **NuevoCliente Interface**: Tipado para creación rápida de clientes
- ✅ **PendingItem Integration**: Integración completa con sistema de tareas pendientes
- ✅ **Type Safety**: Tipado estricto en todas las operaciones
- ✅ **Generic Interfaces**: Interfaces reutilizables entre servicios

### �🎉 [v1.1.3] - 2025-07-10
**Mejoras significativas en UX y funcionalidades del inventario**

#### ✨ Nuevas Características
- ✅ **Truncado Inteligente de Descripción**: Limitación automática a 15 caracteres con tooltip completo
- ✅ **Mejoras en Búsqueda**: Sistema de búsqueda optimizado y más responsivo
- ✅ **Gestión Completa de Vidrio**: Implementación total del módulo de vidrio con CRUD
- ✅ **Gestión Completa de Contorno**: Implementación total del módulo de contorno con CRUD
- ✅ **Validación Mejorada**: Sistema de validación más robusto para todos los tipos de material
- ✅ **Tooltips Informativos**: Información contextual mejorada en toda la interfaz

#### 🔧 Mejoras Técnicas
- ✅ **Optimización de Rendimiento**: Mejoras en el renderizado de listas largas
- ✅ **Filtrado Avanzado**: Sistema de filtros más eficiente y preciso
- ✅ **Gestión de Estado**: Optimizaciones en el estado reactivo del inventario
- ✅ **Responsive Design**: Mejoras en la adaptabilidad móvil y tablet
- ✅ **Accesibilidad**: Implementación de estándares WCAG para mejor accesibilidad

#### 🐛 Correcciones
- ✅ **Bug de Descripción Larga**: Solucionado problema de desbordamiento en tablas
- ✅ **Sincronización de Datos**: Corrección en la actualización automática de inventario
- ✅ **Validación de Formularios**: Fix en validaciones específicas para vidrio y contorno
- ✅ **Manejo de Errores**: Mejora en el manejo de errores de red y validación
- ✅ **Performance de Búsqueda**: Optimización de búsquedas en inventarios grandes

#### 🎨 Mejoras de UI/UX
- ✅ **Indicadores Visuales**: Mejores indicadores de estado y progreso
- ✅ **Navegación Intuitiva**: Flujo de navegación más natural entre módulos
- ✅ **Feedback Visual**: Mejores respuestas visuales a las acciones del usuario
- ✅ **Consistencia de Diseño**: Unificación de patrones de diseño en toda la aplicación

#### 🏗️ Arquitectura
- ✅ **Modularización**: Mejor separación de responsabilidades entre componentes
- ✅ **Servicios Optimizados**: Refactorización de servicios para mejor rendimiento
- ✅ **Interfaces Mejoradas**: Tipado más estricto y interfaces más robustas
- ✅ **Gestión de Memoria**: Optimizaciones para prevenir memory leaks

### 🚀 [v1.1.2] - 2025-05-07
**Implementación del componente de gestión de stock**

#### ✨ Nuevas Características
- ✅ **Componente Stock Modal**: Modal completo para gestión de movimientos de stock
- ✅ **Creación de Stock**: Sistema de registro de nuevos movimientos de stock por tipo de material
- ✅ **Validación por Tipo**: Campos dinámicos según el tipo de material (varilla, trupan, vidrio, contorno)
- ✅ **Información Contextual**: Visualización de stock actual y precio de compra como referencia
- ✅ **IDs Correctos**: Envío apropiado de IDs específicos por tipo de material:
  - `id_producto` para productos
  - `id_materia_prima_varilla` para varillas
  - `id_materia_prima_trupans` para trupan
  - `id_materia_prima_vidrio` para vidrio
  - `id_materia_prima_contorno` para contorno

#### 🔧 Mejoras Técnicas
- ✅ **Formularios Reactivos**: Implementación de formularios dinámicos con validación
- ✅ **Campos Condicionales**: Mostrar largo/alto según el tipo de material
- ✅ **Precio por Defecto**: El precio se inicializa automáticamente con el precio de compra
- ✅ **Estado Sincronizado**: Actualización automática del inventario tras crear stock
- ✅ **Logging Mejorado**: Sistema de debugging para seguimiento de operaciones

#### 🐛 Correcciones
- ✅ **Operaciones CREATE**: Corregido para crear nuevo stock en lugar de actualizar
- ✅ **Refresco de Datos**: Sincronización automática de la lista tras operaciones de stock
- ✅ **Validación de Formularios**: Mejora en validación de campos requeridos
- ✅ **Manejo de Errores**: Implementación robusta de manejo de errores

#### 🏗️ Arquitectura
- ✅ **State Management**: Integración completa con el sistema de estado reactivo
- ✅ **Servicios Especializados**: Servicios dedicados por tipo de stock
- ✅ **Interfaces TypeScript**: Tipado estricto para operaciones de stock
- ✅ **Componentes Reutilizables**: Modal reutilizable para todos los tipos de material

### 🎉 [v1.0.1] - 2025-01-07
**Mejoras en el módulo de inventario**

#### ✨ Nuevas Características
- ✅ Implementación completa del módulo de contornos
- ✅ Sistema de copia de items con validación automática
- ✅ Previsualización de imágenes en modo edición
- ✅ Campos de stock deshabilitados en modo edición
- ✅ Filtrado de subcategorías por categoría seleccionada
- ✅ Gestión de lugares con CRUD completo
- ✅ Visualización de categorías y lugares en lista de inventario

#### 🔧 Mejoras Técnicas
- ✅ Normalización de URLs de imágenes
- ✅ Validación mejorada de formularios
- ✅ Modal responsivo con scroll automático
- ✅ Botones fijos en modales para mejor UX
- ✅ Cálculos automáticos de precios por tipo de material

#### 🐛 Correcciones
- ✅ Corrección en carga inicial de subcategorías
- ✅ Fix en reseteo de formularios
- ✅ Mejora en gestión de estado de componentes
- ✅ Corrección de validaciones en copia de productos

#### 🏗️ Arquitectura
- ✅ Implementación de Signal-based State Management
- ✅ Servicios especializados por tipo de material
- ✅ Interfaces TypeScript robustas
- ✅ Interceptores CORS configurados

### 🚀 [v1.0.0] - 2025-03-05
**Lanzamiento inicial del sistema**

#### 🎯 Características Base
- ✅ Sistema de gestión de inventario completo
- ✅ Módulos de administración y usuarios
- ✅ Gestión de materias primas (Varilla, Trupan, Vidrio)
- ✅ Sistema de autenticación y autorización
- ✅ Dashboard con estadísticas en tiempo real
- ✅ Gestión de categorías y subcategorías

#### 🎨 Interface
- ✅ Diseño responsivo con TailwindCSS
- ✅ Componentes reutilizables
- ✅ Sistema de navegación intuitivo
- ✅ Tema personalizado con colores corporativos

### 📅 Próximas Versiones

#### 🔮 v1.5.0 - En Desarrollo
- 📊 Sistema de reportes avanzados de ventas
- 🧾 Generación de facturas y recibos automáticos
- 📈 Analytics detallados de ventas y preventas
- 🔔 Notificaciones automáticas de preventas vencidas
- 📱 PWA (Progressive Web App) support
- 🔄 Sincronización offline de datos de ventas

#### 🚀 v1.6.0 - Planificado
- 🤖 Integración con sistemas de facturación
- 📦 Gestión avanzada de proveedores
- 🏷️ Sistema de códigos de barras y QR para productos
- 📋 Órdenes de compra automatizadas
- 📊 Dashboard ejecutivo con KPIs de ventas
- 💳 Integración con pasarelas de pago

## 🤝 Contribución

Agradecemos las contribuciones a Minitoys IMS. Para contribuir:

### 📝 Proceso de Contribución

1. **Fork** el repositorio
2. **Crea** una rama para tu feature (`git checkout -b feature/nueva-caracteristica`)
3. **Commit** tus cambios (`git commit -m 'Añade nueva característica'`)
4. **Push** a la rama (`git push origin feature/nueva-caracteristica`)
5. **Abre** un Pull Request

### 📋 Estándares de Código

- Seguir las convenciones de **Angular Style Guide**
- Usar **TypeScript** con tipado estricto
- Implementar **pruebas unitarias** para nuevas funcionalidades
- Documentar cambios en **JSDoc**
- Mantener **cobertura de tests** > 80%

## 📄 Licencia

Este proyecto está licenciado bajo la **Licencia MIT** - ver el archivo [LICENSE.md](LICENSE.md) para más detalles.

```
MIT License

Copyright (c) 2024 MerakiSystem - Minitoys Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files...
```

## 🆘 Soporte

### 📞 Canales de Soporte

- **Email**: support@minitoys.com
- **Issues**: [GitHub Issues](https://github.com/merakisystem/minitoys/issues)
- **Documentación**: [Wiki del Proyecto](https://github.com/merakisystem/minitoys/wiki)
- **Slack**: [Canal de Desarrollo](https://minitoys-dev.slack.com)

### 🔧 Problemas Comunes

<details>
<summary>❌ Error de CORS en desarrollo</summary>

```bash
# Usar el proxy configurado
ng serve --proxy-config proxy.conf.json

# Verificar configuración en proxy.conf.json
```
</details>

<details>
<summary>⚠️ Problemas de compilación TypeScript</summary>

```bash
# Limpiar cache de Angular
ng cache clean

# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```
</details>

## 👨‍💻 Equipo de Desarrollo

### 🏗️ Arquitectura y Desarrollo
- **Lead Developer**: Tu Nombre [@tuusuario](https://github.com/tuusuario)
- **Frontend Specialist**: Especialista Angular
- **Backend Integration**: Desarrollador API

### 🎨 UI/UX Design
- **UI Designer**: Diseñador de Interfaces
- **UX Researcher**: Investigador de Experiencia

### 🧪 Quality Assurance
- **QA Engineer**: Ingeniero de Pruebas
- **DevOps**: Especialista en Deployment

## 🙏 Agradecimientos

- **Angular Team** - Por el excelente framework
- **TailwindCSS Team** - Por el sistema de diseño flexible
- **NgExtension** - Por las utilidades de Signal State Management
- **Font Awesome** - Por los iconos de calidad
- **Comunidad Open Source** - Por las librerías y herramientas

## 📊 Estadísticas del Proyecto

![GitHub stars](https://img.shields.io/github/stars/merakisystem/minitoys?style=social)
![GitHub forks](https://img.shields.io/github/forks/merakisystem/minitoys?style=social)
![GitHub issues](https://img.shields.io/github/issues/merakisystem/minitoys)
![GitHub pull requests](https://img.shields.io/github/issues-pr/merakisystem/minitoys)

---

<div align="center">

**Hecho con ❤️ por el equipo de Minitoys**

*Transformando la gestión de inventarios, un marco a la vez* 🖼️

---

[![Version](https://img.shields.io/badge/Minitoys-v1.7.10-success?style=for-the-badge)](https://github.com/merakisystem/minitoys/releases)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE.md)
[![Built with Angular](https://img.shields.io/badge/Built%20with-Angular%2019-red?style=for-the-badge&logo=angular)](https://angular.io/)

**📦 Minitoys v1.7.10** | Última actualización: Julio 2025

[⬆️ Volver al inicio](#-minitoys---sistema-de-gestión-de-inventarios)

</div>