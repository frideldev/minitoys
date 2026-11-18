import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterOutlet, NavigationStart } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './auth/services/auth.service';
import { AuthStateService } from './auth/services/auth-state.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'minitoys';

  private router = inject(Router);
  private authService = inject(AuthService);
  private authStateService = inject(AuthStateService);

  ngOnInit() {
    // Verificar sesión en CADA navegación (incluyendo clicks del menú dentro de rutas ya activas)
    this.router.events
      .pipe(filter(event => event instanceof NavigationStart))
      .subscribe((event: NavigationStart) => {
        const url = event.url;
        const isProtectedRoute = url.startsWith('/users') || url.startsWith('/admin');

        if (isProtectedRoute && !this.authService.isAuthenticated()) {
          this.authStateService.handleAuthError({ status: 401 });
        }
      });
  }
}
