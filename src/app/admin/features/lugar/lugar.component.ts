import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LugarModalComponent } from '../../components/lugar-modal/lugar-modal.component';
import { LayoutComponent } from "../../../shared/ui/layout/layout.component";
import { TopbarComponent } from "../../../shared/ui/layout/topbar/topbar.component";
import { EstadisticasComponent } from "../../../shared/ui/estadisticas/estadisticas.component";
import { LugarStateService } from '../../services/lugar-state.service';
import { Lugar } from '../../interfaces/lugar.interface';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-lugar',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    LugarModalComponent, 
    LayoutComponent, 
    TopbarComponent, 
    EstadisticasComponent
  ],
  templateUrl: './lugar.component.html'
})
export class LugarComponent implements OnInit {
  private lugarState = inject(LugarStateService);
  showModal = false;
  isEdit = false;
  selectedLugar: Lugar | null = null;
  searchControl = new FormControl('');

  protected state = this.lugarState.state;

  ngOnInit() {
    this.loadLugares();
    this.setupSearch();
  }

  private loadLugares() {
    this.lugarState.refreshData();
  }

  private setupSearch() {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
    ).subscribe(value => {
      if (value) {
        this.lugarState.searchLugares(value);
      } else {
        this.lugarState.refreshData();
      }
    });
  }

  openNewLugarModal() {
    this.isEdit = false;
    this.selectedLugar = null;
    this.showModal = true;
  }

  openEditLugarModal(lugar: Lugar) {
    this.isEdit = true;
    this.selectedLugar = { ...lugar };
    this.showModal = true;
  }

  async confirmDelete(lugar: Lugar) {
    if (!lugar.id) return;
    
    const result = await this.showConfirmDialog(
      '¿Estás seguro?',
      'Esta acción no se puede deshacer'
    );
    
    if (result) {
      this.lugarState.deleteLugar(lugar.id);
    }
  }

  onSaveLugar(lugar: Lugar) {
    if (this.isEdit && this.selectedLugar?.id) {
      this.lugarState.updateLugar(this.selectedLugar.id, lugar);
    } else {
      this.lugarState.createLugar(lugar);
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
