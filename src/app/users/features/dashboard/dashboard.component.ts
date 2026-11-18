import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from "../../../shared/ui/layout/layout.component";
import { ResumenventasComponent } from "./ui/resumenventas/resumenventas.component";
import { StockcriticoComponent } from "./ui/stockcritico/stockcritico.component";
// import { WeeksalesComponent } from "./ui/weeksales/weeksales.component";
import { PendingListComponent } from "../../../shared/ui/pending-list/pending-list.component";
import { TopbarComponent } from "../../../shared/ui/layout/topbar/topbar.component";
import { PendingConfig } from "../../../shared/ui/pending-list/interfaces/pending-item.interface";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    LayoutComponent, 
    ResumenventasComponent, 
    StockcriticoComponent, 
    // WeeksalesComponent, 
    PendingListComponent, 
    TopbarComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  /**
   * Configuración para el componente pending-list
   */
  pendingConfig: PendingConfig = {
    title: 'Pedidos Pendientes',
    showFilters: false, // Ocultar filtros en el dashboard
    showSearch: true,
    allowActions: true,
    itemsPerPage: 5, // Mostrar menos items en el dashboard
    enablePagination: true
  };

  ngOnInit(): void {
    // Ya no necesitamos cargar datos manualmente, 
    // el componente pending-list lo hace automáticamente
  }

}
