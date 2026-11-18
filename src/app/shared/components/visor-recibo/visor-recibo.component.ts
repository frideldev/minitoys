import { Component, inject, input, output, ViewEncapsulation, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { CajaDiariaStateService } from '../../../users/features/reportes/services/caja-diaria-state.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-visor-recibo',
  imports: [CommonModule],
  templateUrl: './visor-recibo.component.html',
  styleUrl: './visor-recibo.component.css',
  encapsulation: ViewEncapsulation.None
})
export class VisorReciboComponent implements OnInit, OnChanges {
  private cajaDiariaState = inject(CajaDiariaStateService);
  private http = inject(HttpClient);

  // Inputs
  isVisible = input<boolean>(false);
  ventaId = input<number | null>(null);

  // Outputs
  onClose = output<void>();

  // Computed states del service
  reciboHtml = this.cajaDiariaState.state.reciboHtml;
  reciboLoading = this.cajaDiariaState.state.reciboLoading;
  
  // Estado para generación de PDF
  generandoPdf = false;

  ngOnInit() {
    // Si hay un ventaId cuando se inicializa, cargar el recibo
    if (this.ventaId()) {
      this.cargarRecibo(this.ventaId()!);
    }
  }

  ngOnChanges() {
    // Cargar recibo cuando cambia el ventaId
    if (this.ventaId() && this.isVisible()) {
      this.cargarRecibo(this.ventaId()!);
    }
    
    // Limpiar recibo cuando se cierra el modal
    if (!this.isVisible()) {
      this.limpiarRecibo();
    }
  }

  cargarRecibo(id: number) {
    this.cajaDiariaState.cargarRecibo(id);
  }

  limpiarRecibo() {
    this.cajaDiariaState.limpiarRecibo();
  }

  cerrarModal() {
    this.limpiarRecibo();
    this.onClose.emit();
  }

  imprimir() {
    const ventaId = this.ventaId();
    if (!ventaId) {
      console.warn('No hay ID de venta para generar PDF');
      alert('Error: No se puede generar el PDF. ID de venta no disponible.');
      return;
    }

    this.generandoPdf = true;
    
    try {
      // Construir URL del PDF
      const pdfUrl = `${environment.API_URL}/recibo/pdf/${ventaId}`;
      
      // Abrir en nueva pestaña
      const nuevaVentana = window.open(pdfUrl, '_blank');
      
      // Verificar si se pudo abrir la ventana (bloqueador de popups)
      if (!nuevaVentana) {
        alert('El navegador bloqueó la ventana emergente. Por favor, permite las ventanas emergentes para este sitio.');
      }
      
      // Simular un pequeño delay para mostrar el estado de loading
      setTimeout(() => {
        this.generandoPdf = false;
      }, 1000);
      
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF. Por favor, inténtalo de nuevo.');
      this.generandoPdf = false;
    }
  }
}
