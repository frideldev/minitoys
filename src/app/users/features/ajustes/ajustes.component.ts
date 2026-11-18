import { Component } from '@angular/core';
import { EstadisticasComponent } from "../../../shared/ui/estadisticas/estadisticas.component";
import { TopbarComponent } from "../../../shared/ui/layout/topbar/topbar.component";
import { LayoutComponent } from "../../../shared/ui/layout/layout.component";
import { SoporteComponent } from "../../../shared/ui/soporte/soporte.component";

@Component({
  selector: 'app-ajustes',
  imports: [TopbarComponent, LayoutComponent, SoporteComponent],
  templateUrl: './ajustes.component.html',
  styleUrl: './ajustes.component.css'
})
export class AjustesComponent {

}
