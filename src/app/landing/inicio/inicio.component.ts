import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthStateService } from '../../auth/services/auth-state.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent {
  private authState = inject(AuthStateService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  loginForm: FormGroup = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  // Update to access the full state instead of just authentication status
  protected state = this.authState.state;

  constructor() {
    effect(() => {
      const currentState = this.state();
      console.log('Current state:', currentState);
      
      if (currentState.status === 'success' && currentState.user) {
        this.router.navigate(['/users']);
      }
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      console.log('Submitting login...', { status: this.state().status });
      this.authState.login(username, password);
    }
  }
}
