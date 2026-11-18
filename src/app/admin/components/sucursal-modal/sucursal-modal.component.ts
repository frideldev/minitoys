import { Component, EventEmitter, Input, OnInit, inject, Output, SimpleChanges, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Sucursal } from '../../interfaces/sucursal.interface';
@Component({
  selector: 'app-sucursal-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sucursal-modal.component.html'
})
export class SucursalModalComponent implements OnInit,OnChanges {
  @Input() isOpen = false;
  @Input() isEdit = false;
  @Input() sucursal: Sucursal | null = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() saveSucursal = new EventEmitter<Sucursal>();

  private fb = inject(FormBuilder);
  sucursalForm!: FormGroup;

  ngOnInit() {
    this.initForm();
  }
 ngOnChanges(changes: SimpleChanges) {
    if (changes['sucursal'] && this.sucursalForm) {
      if (this.sucursal) {
        this.sucursalForm.patchValue({
          ...this.sucursal,
        });
      } else {
        this.sucursalForm.reset();
      }
    }
  }
  

  private initForm() {
    this.sucursalForm = this.fb.group({
      lugar: ['', [Validators.required]],
    });

    if (this.isEdit && this.sucursal) {
      this.sucursalForm.patchValue(this.sucursal);
    }
  }

  onSubmit() {
    if (this.sucursalForm.valid) {
      const formData = this.sucursalForm.value;
      const sucursalData: Sucursal = {
        ...formData,
        id: this.sucursal?.id
      };
      this.saveSucursal.emit(sucursalData);
      this.onClose();
    }
  }

  onClose() {
    this.sucursalForm.reset();
    this.closeModal.emit();
  }
}