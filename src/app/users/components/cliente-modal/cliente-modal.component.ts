import { Component, EventEmitter, Input, OnInit, SimpleChanges, inject, OnChanges, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Cliente } from '../../interfaces/cliente.interface';
import { formatDateForInput, formatDateForAPI } from '../../../shared/utils/date.utils';

@Component({
  selector: 'app-cliente-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cliente-modal.component.html'
})
export class ClienteModalComponent implements OnInit, OnChanges {
  @Input() isOpen = false;
  @Input() isEdit = false;
  @Input() cliente: Cliente | null = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() saveCliente = new EventEmitter<Cliente>();

  private fb = inject(FormBuilder);
  clienteForm!: FormGroup;

  // Add max date property (today)
  maxDate = new Date().toISOString().split('T')[0];

  ngOnInit() {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['cliente'] && this.clienteForm) {
      if (this.cliente) {
        this.clienteForm.patchValue({
          ...this.cliente,
          fechaNacimiento: formatDateForInput(this.cliente.fechaNacimiento)
        });
      } else {
        this.clienteForm.reset();
      }
    }
  }

  private initForm() {
    this.clienteForm = this.fb.group({
      ci: ['', [Validators.required]],
      nombre: ['', [Validators.required]],
      apellido: ['', [Validators.required]],
      fechaNacimiento: ['', [Validators.required]],
      telefono: ['', [Validators.required]],
      direccion: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]]
    });

    if (this.isEdit && this.cliente) {
      this.clienteForm.patchValue(this.cliente);
    }
  }

  onSubmit() {
    if (this.clienteForm.valid) {
      const formData = this.clienteForm.value;
      const clienteData: Cliente = {
        ...formData,
        id: this.cliente?.id,
        fechaNacimiento: formatDateForAPI(formData.fechaNacimiento)
      };
      this.saveCliente.emit(clienteData);
      this.onClose();
    }
  }

  onClose() {
    this.clienteForm.reset();
    this.closeModal.emit();
  }
}