export interface PendingItem {
  id: number;
  title: string;
  subtitle?: string;
  description?: string;
  type: PendingType;
  status: PendingStatus;
  priority: PendingPriority;
  date: string;
  amount?: number;
  clientName?: string;
  categoria?: 'productos' | 'marcos' | 'mixto'; // Nueva propiedad para discriminar
  tipoVenta?: TipoVentaCase; // Nuevo: Identifica el caso específico de venta
  metadata?: any; // Para datos adicionales específicos del tipo
}

// Nuevos tipos para identificar los casos de venta
export type TipoVentaCase = 
  | 'preventa_sin_adelanto'      // Caso 2: pago=0, recogido=false, forma_pago_id=0
  | 'preventa_con_adelanto'      // Caso 3: pago=adelanto, recogido=false
  | 'marco_sin_adelanto'         // Caso 4: pago=0, recogido=false, forma_pago_id=0
  | 'marco_con_adelanto'         // Caso 5: pago=adelanto, recogido=false
  | 'venta_completada'           // Casos 1 y 6: pago=total, recogido=true (no aparece en pendientes)
  | 'desconocido';

export type PendingType = 
  | 'preventa' 
  | 'order' 
  | 'payment' 
  | 'delivery' 
  | 'stock' 
  | 'maintenance'
  | 'customer_request'
  | 'other';

export type PendingStatus = 
  | 'pending' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled' 
  | 'overdue';

export type PendingPriority = 
  | 'low' 
  | 'medium' 
  | 'high' 
  | 'urgent';

export interface PendingConfig {
  title: string;
  showFilters: boolean;
  showSearch: boolean;
  allowActions: boolean;
  itemsPerPage: number;
  enablePagination: boolean;
}
