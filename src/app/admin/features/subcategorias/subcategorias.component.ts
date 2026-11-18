import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SucursalModalComponent } from '../../components/subcategoria-modal/subcategoria-modal.component';
import { LayoutComponent } from "../../../shared/ui/layout/layout.component";
import { TopbarComponent } from "../../../shared/ui/layout/topbar/topbar.component";
import { EstadisticasComponent } from "../../../shared/ui/estadisticas/estadisticas.component";
import { SubCategoriasStateService } from '../../services/subcategorias-state.service';
import { CategoriasStateService } from '../../services/categorias-state.service';
import { SubCategoria} from '../../interfaces/subcategoria.interface';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [CommonModule, SucursalModalComponent, LayoutComponent, TopbarComponent, EstadisticasComponent],
  templateUrl: './subcategorias.component.html'
})
export class SubCategoriasComponent implements OnInit {
  private subcategoriasState = inject(SubCategoriasStateService);
  private categoriasState = inject(CategoriasStateService);
  showModal = false;
  isEdit = false;
  selectedCategoria: SubCategoria | null = null;

  protected state = this.subcategoriasState.state;

  ngOnInit() {
    // Initial load of clients
    this.loadSubCategorias();
    this.categoriasState.refreshData(); // Load categories for reference
  }

  private loadSubCategorias() {
    this.subcategoriasState.refreshData();
  }

  openNewSubCategoriaModal() {
    this.isEdit = false;
    this.selectedCategoria = null;
    this.showModal = true;
  }

  openEditSubCategoriaModal(categoria: SubCategoria) {
    this.isEdit = true;
    this.selectedCategoria = { ...categoria }; // Create a copy of the client data
    this.showModal = true;
  }

  async confirmDelete(categoria: SubCategoria) {
    if (!categoria.id) return;
    
    const result = await this.showConfirmDialog(
      '¿Estás seguro?',
      'Esta acción no se puede deshacer'
    );
    
    if (result) {
      this.subcategoriasState.deleteSubCategoria(categoria.id);
    }
  }

  onSaveSubCategoria(categoria: SubCategoria) {
    if (this.isEdit && this.selectedCategoria?.id) {
      this.subcategoriasState.updateSubCategoria(this.selectedCategoria.id, categoria);
    } else {
      this.subcategoriasState.createSubCategoria(categoria);
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

  getCategoriaName(id_categoria: number): string {
    const categoria = this.categoriasState.state().categorias
      .find(cat => cat.id === id_categoria);
    return categoria ? categoria.nombre : 'No encontrada';
  }
}
