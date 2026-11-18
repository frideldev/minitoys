import { Component } from '@angular/core';
import { NavbarComponent } from "./navbar/navbar.component";
import { LogoComponent } from "./logo/logo.component";

@Component({
  selector: 'app-sidebar',
  imports: [NavbarComponent, LogoComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {

}
