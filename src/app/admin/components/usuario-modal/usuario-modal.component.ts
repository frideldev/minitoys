import { Component, EventEmitter, Input, OnInit, SimpleChanges, inject, OnChanges, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Usuario } from '../../interfaces/usuario.interface';
import { SucursalesStateService } from '../../services/sucursales-state.service';

@Component({
  selector: 'app-usuario-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './usuario-modal.component.html'
})
export class UsuarioModalComponent implements OnInit, OnChanges {
  @Input() isOpen = false;
  @Input() isEdit = false;
  @Input() usuario: Usuario | null = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() saveUsuario = new EventEmitter<Usuario>();

  private fb = inject(FormBuilder);
  private sucursalesState = inject(SucursalesStateService);
  
  usuarioForm!: FormGroup;
  protected state = this.sucursalesState.state;

  ngOnInit() {
    this.initForm();
    // Load sucursales when component initializes
    this.sucursalesState.refreshData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['usuario'] && this.usuarioForm) {
      if (this.usuario) {
        this.usuarioForm.patchValue({
          ...this.usuario,
        });
      } else {
        this.usuarioForm.reset();
      }
    }
  }

  private initForm() {
    this.usuarioForm = this.fb.group({
      name: ['', [Validators.required]],
      username: ['', [Validators.required]],
      password: ['', [
        Validators.required,
        Validators.minLength(8)
      ]],
      password_confirmation: ['', [Validators.required]],
      id_sucursal: ['', [Validators.required]],
      id_rol: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]]
    }, {
      validators: this.passwordMatchValidator
    });

    if (this.isEdit && this.usuario) {
      const userWithoutPasswords = { ...this.usuario };
      delete (userWithoutPasswords as Partial<Usuario>).password;
      delete (userWithoutPasswords as Partial<Usuario>).password_confirmation;
      this.usuarioForm.patchValue(userWithoutPasswords);
      
      if (this.isEdit) {
        this.usuarioForm.get('password')?.clearValidators();
        this.usuarioForm.get('password_confirmation')?.clearValidators();
        this.usuarioForm.get('password')?.updateValueAndValidity();
        this.usuarioForm.get('password_confirmation')?.updateValueAndValidity();
      }
    }
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('password_confirmation');

    if (!password || !confirmPassword) return null;

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  getPasswordError(): string {
    const password = this.usuarioForm.get('password');
    if (!password?.errors) return '';
    
    if (password.errors['required']) return 'La contraseña es requerida';
    if (password.errors['minlength']) return 'La contraseña debe tener al menos 8 caracteres';
    
    return 'Error en la contraseña';
  }

  getPasswordMatchError(): string {
    return this.usuarioForm.errors?.['passwordMismatch'] ? 
      'Las contraseñas no coinciden' : '';
  }

  onSubmit() {
    if (this.usuarioForm.valid) {
      const formData = this.usuarioForm.value;
      const usuarioData: Usuario = {
        ...formData,
        id: this.usuario?.id
      };
      this.saveUsuario.emit(usuarioData);
      this.onClose();
    }
  }

  onClose() {
    this.usuarioForm.reset();
    this.closeModal.emit();
  }
}