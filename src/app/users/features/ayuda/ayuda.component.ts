import { Component } from '@angular/core';
import { EstadisticasComponent } from "../../../shared/ui/estadisticas/estadisticas.component";
import { TopbarComponent } from "../../../shared/ui/layout/topbar/topbar.component";
import { LayoutComponent } from "../../../shared/ui/layout/layout.component";
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-ayuda',
  imports: [RouterLink, TopbarComponent, LayoutComponent],
  templateUrl: './ayuda.component.html',
  styleUrl: './ayuda.component.css'
})
export class AyudaComponent {

}
