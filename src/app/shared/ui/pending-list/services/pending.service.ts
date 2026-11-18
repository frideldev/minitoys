import { Injectable, inject } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { PendingItem, PendingType, PendingStatus } from '../interfaces/pending-item.interface';

@Injectable({
  providedIn: 'root'
})
export class PendingService {
  private pendingItemsSubject = new BehaviorSubject<PendingItem[]>([]);
  public pendingItems$ = this.pendingItemsSubject.asObservable();

  constructor() {
    // Cargar datos iniciales de ejemplo
    this.loadInitialData();
  }

  private loadInitialData() {
    // Datos de ejemplo - en una implementación real, estos vendrían del backend
    const sampleData: PendingItem[] = [
      {
        id: 1,
        title: 'Preventa #001',
        subtitle: 'Cámara Canon EOS R5 + Lente 24-70mm',
        description: 'Cliente solicita entrega la próxima semana',
        type: 'preventa',
        status: 'pending',
        priority: 'high',
        date: '2025-01-10T10:30:00Z',
        amount: 8500,
        clientName: 'María García',
        metadata: { preventaId: 1 }
      },
      {
        id: 2,
        title: 'Pago Pendiente #002',
        subtitle: 'Transferencia bancaria por confirmar',
        description: 'Cliente envió comprobante, pendiente verificación',
        type: 'payment',
        status: 'pending',
        priority: 'medium',
        date: '2025-01-11T08:15:00Z',
        amount: 2300,
        clientName: 'Carlos Mendoza'
      },
      {
        id: 3,
        title: 'Stock Bajo',
        subtitle: 'Baterías Canon LP-E6NH',
        description: 'Solo quedan 3 unidades en inventario',
        type: 'stock',
        status: 'pending',
        priority: 'urgent',
        date: '2025-01-11T14:20:00Z'
      },
      {
        id: 4,
        title: 'Entrega Programada',
        subtitle: 'Pedido #0045 - Equipo completo de iluminación',
        description: 'Entrega programada para mañana 9:00 AM',
        type: 'delivery',
        status: 'in_progress',
        priority: 'high',
        date: '2025-01-09T16:00:00Z',
        amount: 4200,
        clientName: 'Estudio Fotográfico Luz'
      },
      {
        id: 5,
        title: 'Solicitud de Cliente',
        subtitle: 'Cotización para evento corporativo',
        description: 'Cliente solicita cotización para sesión de fotos corporativas para 50 empleados',
        type: 'customer_request',
        status: 'pending',
        priority: 'medium',
        date: '2025-01-11T11:45:00Z',
        clientName: 'Empresa TecnoSoft'
      }
    ];

    this.pendingItemsSubject.next(sampleData);
  }

  // Obtener todos los pendientes
  getPendingItems(): Observable<PendingItem[]> {
    return this.pendingItems$;
  }

  // Obtener pendientes por tipo
  getPendingItemsByType(type: PendingType): Observable<PendingItem[]> {
    return new Observable(observer => {
      this.pendingItems$.subscribe(items => {
        const filtered = items.filter(item => item.type === type);
        observer.next(filtered);
      });
    });
  }

  // Obtener pendientes por estado
  getPendingItemsByStatus(status: PendingStatus): Observable<PendingItem[]> {
    return new Observable(observer => {
      this.pendingItems$.subscribe(items => {
        const filtered = items.filter(item => item.status === status);
        observer.next(filtered);
      });
    });
  }

  // Actualizar estado de un pendiente
  updatePendingItemStatus(id: number, status: PendingStatus): Observable<boolean> {
    const items = this.pendingItemsSubject.value;
    const index = items.findIndex(item => item.id === id);
    
    if (index !== -1) {
      items[index] = { ...items[index], status };
      this.pendingItemsSubject.next([...items]);
      return of(true);
    }
    
    return of(false);
  }

  // Eliminar un pendiente
  removePendingItem(id: number): Observable<boolean> {
    const items = this.pendingItemsSubject.value;
    const filtered = items.filter(item => item.id !== id);
    
    if (filtered.length !== items.length) {
      this.pendingItemsSubject.next(filtered);
      return of(true);
    }
    
    return of(false);
  }

  // Agregar un nuevo pendiente
  addPendingItem(item: Omit<PendingItem, 'id'>): Observable<PendingItem> {
    const items = this.pendingItemsSubject.value;
    const newId = Math.max(...items.map(i => i.id), 0) + 1;
    const newItem: PendingItem = { ...item, id: newId };
    
    this.pendingItemsSubject.next([...items, newItem]);
    return of(newItem);
  }

  // Obtener estadísticas de pendientes
  getPendingStats(): Observable<{
    total: number;
    byStatus: Record<PendingStatus, number>;
    byType: Record<PendingType, number>;
    byPriority: Record<string, number>;
  }> {
    return new Observable(observer => {
      this.pendingItems$.subscribe(items => {
        const stats = {
          total: items.length,
          byStatus: {} as Record<PendingStatus, number>,
          byType: {} as Record<PendingType, number>,
          byPriority: { low: 0, medium: 0, high: 0, urgent: 0 }
        };

        // Count by status
        items.forEach(item => {
          stats.byStatus[item.status] = (stats.byStatus[item.status] || 0) + 1;
          stats.byType[item.type] = (stats.byType[item.type] || 0) + 1;
          stats.byPriority[item.priority] = (stats.byPriority[item.priority] || 0) + 1;
        });

        observer.next(stats);
      });
    });
  }
}
