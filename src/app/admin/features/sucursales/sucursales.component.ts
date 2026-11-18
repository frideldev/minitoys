import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SucursalModalComponent } from '../../components/sucursal-modal/sucursal-modal.component';
import { LayoutComponent } from "../../../shared/ui/layout/layout.component";
import { TopbarComponent } from "../../../shared/ui/layout/topbar/topbar.component";
import { EstadisticasComponent } from "../../../shared/ui/estadisticas/estadisticas.component";
import { SucursalesStateService } from '../../services/sucursales-state.service';
import { Sucursal} from '../../interfaces/sucursal.interface';

@Component({
  selector: 'app-sucursales',
  standalone: true,
  imports: [CommonModule, SucursalModalComponent, LayoutComponent, TopbarComponent, EstadisticasComponent],
  templateUrl: './sucursales.component.html'
})
export class SucursalesComponent implements OnInit {
  private sucursalesState = inject(SucursalesStateService);
  showModal = false;
  isEdit = false;
  selectedSucursal: Sucursal | null = null;

  protected state = this.sucursalesState.state;

  ngOnInit() {
    // Initial load of clients
    this.loadSucursales();
  }

  private loadSucursales() {
    this.sucursalesState.refreshData();
  }

  openNewSucursalModal() {
    this.isEdit = false;
    this.selectedSucursal = null;
    this.showModal = true;
  }

  openEditSucursalModal(sucursal: Sucursal) {
    this.isEdit = true;
    this.selectedSucursal = { ...sucursal }; // Create a copy of the client data
    this.showModal = true;
  }

  async confirmDelete(sucursal: Sucursal) {
    if (!sucursal.id) return;
    
    const result = await this.showConfirmDialog(
      '¿Estás seguro?',
      'Esta acción no se puede deshacer'
    );
    
    if (result) {
      this.sucursalesState.deleteSucursal(sucursal.id);
    }
  }

  onSaveSucursal(sucursal: Sucursal) {
    if (this.isEdit && this.selectedSucursal?.id) {
      this.sucursalesState.updateSucursal(this.selectedSucursal.id, sucursal);
    } else {
      this.sucursalesState.createSucursal(sucursal);
    }
    this.showModal = false;
  }

  private showConfirmDialog(title: string, message: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (confirm(`${title}\n${message}`)) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  }
}
