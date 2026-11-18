import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormaPagoModalComponent } from '../../components/formapago-modal/formapago-modal.component';
import { LayoutComponent } from "../../../shared/ui/layout/layout.component";
import { TopbarComponent } from "../../../shared/ui/layout/topbar/topbar.component";
import { EstadisticasComponent } from "../../../shared/ui/estadisticas/estadisticas.component";
import { FormasPagoStateService } from '../../services/formaspago-state.service';
import { FormaPago } from '../../interfaces/formapago.interface';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-formaspago',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormaPagoModalComponent, LayoutComponent, TopbarComponent, EstadisticasComponent],
  templateUrl: './formaspago.component.html'
})
export class FormasPagoComponent implements OnInit {
  private formasPagoState = inject(FormasPagoStateService);
  showModal = false;
  isEdit = false;
  selectedFormaPago: FormaPago | null = null;
  searchControl = new FormControl('');

  protected state = this.formasPagoState.state;

  ngOnInit() {
    // Initial load of payment methods
    this.loadFormasPago();
    this.setupSearch();
  }

  private loadFormasPago() {
    this.formasPagoState.refreshData();
  }

  private setupSearch() {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
    ).subscribe(value => {
      if (value) {
        this.formasPagoState.searchFormasPago(value);
      } else {
        this.formasPagoState.refreshData();
      }
    });
  }

  openNewFormaPagoModal() {
    this.isEdit = false;
    this.selectedFormaPago = null;
    this.showModal = true;
  }

  openEditFormaPagoModal(formaPago: FormaPago) {
    this.isEdit = true;
    this.selectedFormaPago = { ...formaPago }; // Create a copy of the payment method data
    this.showModal = true;
  }

  async confirmDelete(formaPago: FormaPago) {
    if (!formaPago.id) return;
    
    const result = await this.showConfirmDialog(
      '¿Estás seguro?',
      'Esta acción no se puede deshacer'
    );
    
    if (result) {
      this.formasPagoState.deleteFormaPago(formaPago.id);
    }
  }

  onSaveFormaPago(formaPago: FormaPago) {
    if (this.isEdit && this.selectedFormaPago?.id) {
      this.formasPagoState.updateFormaPago(this.selectedFormaPago.id, formaPago);
    } else {
      this.formasPagoState.createFormaPago(formaPago);
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
