import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthStateService } from '../../../../auth/services/auth-state.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.css'
})
export class TopbarComponent {
  @Input() tipo = '';
  
  private authState = inject(AuthStateService);
  private router = inject(Router);

  protected user = this.authState.getCurrentUser();
  showDropdown = false;

  getRoleName(idRol: number): string {
    switch (idRol) {
      case 1: return 'Admin';
      case 2: return 'Vendedor';
      case 3: return 'Supervisor';
      default: return 'Usuario';
    }
  }

  logout() {
    this.authState.logout();
    this.router.navigate(['/landing']);
  }
}
