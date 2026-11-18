import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SucursalModalComponent } from '../../components/categoria-modal/categoria-modal.component';
import { LayoutComponent } from "../../../shared/ui/layout/layout.component";
import { TopbarComponent } from "../../../shared/ui/layout/topbar/topbar.component";
import { EstadisticasComponent } from "../../../shared/ui/estadisticas/estadisticas.component";
import { CategoriasStateService } from '../../services/categorias-state.service';
import { Categoria} from '../../interfaces/categoria.interface';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [CommonModule, SucursalModalComponent, LayoutComponent, TopbarComponent, EstadisticasComponent],
  templateUrl: './categorias.component.html'
})
export class CategoriasComponent implements OnInit {
  private categoriasState = inject(CategoriasStateService);
  showModal = false;
  isEdit = false;
  selectedCategoria: Categoria | null = null;

  protected state = this.categoriasState.state;

  ngOnInit() {
    // Initial load of clients
    this.loadCategorias();
  }

  private loadCategorias() {
    this.categoriasState.refreshData();
  }

  openNewCategoriaModal() {
    this.isEdit = false;
    this.selectedCategoria = null;
    this.showModal = true;
  }

  openEditCategoriaModal(categoria: Categoria) {
    this.isEdit = true;
    this.selectedCategoria = { ...categoria }; // Create a copy of the client data
    this.showModal = true;
  }

  async confirmDelete(categoria: Categoria) {
    if (!categoria.id) return;
    
    const result = await this.showConfirmDialog(
      '¿Estás seguro?',
      'Esta acción no se puede deshacer'
    );
    
    if (result) {
      this.categoriasState.deleteCategoria(categoria.id);
    }
  }

  onSaveCategoria(categoria: Categoria) {
    if (this.isEdit && this.selectedCategoria?.id) {
      this.categoriasState.updateCategoria(this.selectedCategoria.id, categoria);
    } else {
      this.categoriasState.createCategoria(categoria);
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
  onTipoChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.categoriasState.filterByTipo(selectElement.value);
  }
}
