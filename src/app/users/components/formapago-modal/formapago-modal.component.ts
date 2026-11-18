import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormaPago } from '../../interfaces/formapago.interface';

@Component({
  selector: 'app-formapago-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './formapago-modal.component.html'
})
export class FormaPagoModalComponent implements OnInit, OnChanges {
  @Input() isOpen = false;
  @Input() isEdit = false;
  @Input() formaPago: FormaPago | null = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() saveFormaPago = new EventEmitter<FormaPago>();

  formaPagoForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['formaPago'] || changes['isEdit']) {
      this.initForm();
    }
  }

  private initForm() {
    this.formaPagoForm = this.fb.group({
      nombre: [this.formaPago?.nombre || '', [Validators.required, Validators.minLength(2)]],
      descripcion: [this.formaPago?.descripcion || ''],
      activo: [this.formaPago?.activo ?? true]
    });
  }

  onSubmit() {
    if (this.formaPagoForm.valid) {
      const formaPagoData: FormaPago = {
        ...this.formaPagoForm.value
      };

      if (this.isEdit && this.formaPago?.id) {
        formaPagoData.id = this.formaPago.id;
      }

      this.saveFormaPago.emit(formaPagoData);
      this.onClose();
    }
  }

  onClose() {
    this.closeModal.emit();
    this.formaPagoForm.reset();
  }

  get nombre() { return this.formaPagoForm.get('nombre'); }
  get descripcion() { return this.formaPagoForm.get('descripcion'); }
  get activo() { return this.formaPagoForm.get('activo'); }
}
