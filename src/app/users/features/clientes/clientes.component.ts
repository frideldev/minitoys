import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClienteModalComponent } from '../../components/cliente-modal/cliente-modal.component';
import { LayoutComponent } from "../../../shared/ui/layout/layout.component";
import { TopbarComponent } from "../../../shared/ui/layout/topbar/topbar.component";
import { EstadisticasComponent } from "../../../shared/ui/estadisticas/estadisticas.component";
import { ClientesStateService } from '../../services/clientes-state.service';
import { Cliente } from '../../interfaces/cliente.interface';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ClienteModalComponent, LayoutComponent, TopbarComponent, EstadisticasComponent],
  templateUrl: './clientes.component.html'
})
export class ClientesComponent implements OnInit {
  private clientesState = inject(ClientesStateService);
  showModal = false;
  isEdit = false;
  selectedCliente: Cliente | null = null;
  searchControl = new FormControl('');

  protected state = this.clientesState.state;

  ngOnInit() {
    // Initial load of clients
    this.loadClients();
    this.setupSearch();
  }

  private loadClients() {
    this.clientesState.refreshData();
  }

  private setupSearch() {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
    ).subscribe(value => {
      if (value) {
        this.clientesState.searchClientes(value);
      } else {
        this.clientesState.refreshData();
      }
    });
  }

  openNewClientModal() {
    this.isEdit = false;
    this.selectedCliente = null;
    this.showModal = true;
  }

  openEditClientModal(cliente: Cliente) {
    this.isEdit = true;
    this.selectedCliente = { ...cliente }; // Create a copy of the client data
    this.showModal = true;
  }

  async confirmDelete(cliente: Cliente) {
    if (!cliente.id) return;
    
    const result = await this.showConfirmDialog(
      '¿Estás seguro?',
      'Esta acción no se puede deshacer'
    );
    
    if (result) {
      this.clientesState.deleteCliente(cliente.id);
    }
  }

  onSaveCliente(cliente: Cliente) {
    if (this.isEdit && this.selectedCliente?.id) {
      this.clientesState.updateCliente(this.selectedCliente.id, cliente);
    } else {
      this.clientesState.createCliente(cliente);
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
