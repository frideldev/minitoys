import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit, OnDestroy {
  
  ngOnInit(): void {
    // Agregar event listener para cerrar el menú al hacer clic fuera
    document.addEventListener('click', this.handleOutsideClick.bind(this));
  }

  ngOnDestroy(): void {
    // Limpiar event listeners
    document.removeEventListener('click', this.handleOutsideClick.bind(this));
  }

  /**
   * Alterna la visibilidad del menú móvil
   */
  toggleMenu(): void {
    const menu = document.getElementById('mobileMenu');
    if (menu) {
      menu.classList.toggle('active');
    }
  }

  /**
   * Cierra el menú móvil
   */
  closeMenu(): void {
    const menu = document.getElementById('mobileMenu');
    if (menu) {
      menu.classList.remove('active');
    }
  }

  /**
   * Maneja clics fuera del menú para cerrarlo
   */
  private handleOutsideClick(event: Event): void {
    const menu = document.getElementById('mobileMenu');
    const target = event.target as HTMLElement;
    
    if (menu && menu.classList.contains('active')) {
      // Si el clic no es dentro del menú ni en el botón del menú
      if (!menu.contains(target) && !target.closest('.menu-toggle')) {
        this.closeMenu();
      }
    }
  }

  /**
   * Maneja el clic en los enlaces del menú
   */
  onMenuItemClick(): void {
    // Cerrar el menú cuando se hace clic en un enlace
    this.closeMenu();
  }
}
