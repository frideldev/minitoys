import { Component } from '@angular/core';
import { HeaderComponent } from "./header/header.component";
import { SidebarComponent } from "./sidebar/sidebar.component";
import { FooterComponent } from "./footer/footer.component";
import { TopbarComponent } from "./topbar/topbar.component";
import { LogoComponent } from "./sidebar/logo/logo.component";
import { NavbarComponent } from "./sidebar/navbar/navbar.component";

@Component({
  selector: 'app-layout',
  imports: [HeaderComponent, FooterComponent, LogoComponent, NavbarComponent, TopbarComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {
 
}
