import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuarioModalComponent } from '../../components/usuario-modal/usuario-modal.component';
import { LayoutComponent } from "../../../shared/ui/layout/layout.component";
import { TopbarComponent } from "../../../shared/ui/layout/topbar/topbar.component";
import { EstadisticasComponent } from "../../../shared/ui/estadisticas/estadisticas.component";
import { UsuariosStateService } from '../../services/usuarios-state.service';
import { Usuario } from '../../interfaces/usuario.interface';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, UsuarioModalComponent, LayoutComponent, TopbarComponent, EstadisticasComponent],
  templateUrl: './usuarios.component.html'
})
export class UsuariosComponent implements OnInit {
  private usuariosState = inject(UsuariosStateService);
  showModal = false;
  isEdit = false;
  selectedUsuario: Usuario | null = null;

  protected state = this.usuariosState.state;

  ngOnInit() {
    // Initial load of clients
    this.loadUsuarios();
  }

  private loadUsuarios() {
    this.usuariosState.refreshData();
  }

  openNewUsuarioModal() {
    this.isEdit = false;
    this.selectedUsuario = null;
    this.showModal = true;
  }

  openEditUsuarioModal(usuario: Usuario) {
    this.isEdit = true;
    this.selectedUsuario = { ...usuario }; // Create a copy of the client data
    this.showModal = true;
  }

  async confirmDelete(usuario: Usuario) {
    if (!usuario.id) return;
    
    const result = await this.showConfirmDialog(
      '¿Estás seguro?',
      'Esta acción no se puede deshacer'
    );
    
    if (result) {
      this.usuariosState.deleteUsuario(usuario.id);
    }
  }

  onSaveUsuario(usuario: Usuario) {
    if (this.isEdit && this.selectedUsuario?.id) {
      this.usuariosState.updateUsuario(this.selectedUsuario.id, usuario);
    } else {
      this.usuariosState.createUsuario(usuario);
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
