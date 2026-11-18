import { Component, EventEmitter, Input, OnInit, inject, Output, SimpleChanges, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Categoria } from '../../interfaces/categoria.interface';
@Component({
  selector: 'app-sucursal-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './categoria-modal.component.html'
})
export class SucursalModalComponent implements OnInit,OnChanges {
  @Input() isOpen = false;
  @Input() isEdit = false;
  @Input() categoria: Categoria | null = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() saveCategoria = new EventEmitter<Categoria>();

  private fb = inject(FormBuilder);
  categoriaForm!: FormGroup;

  ngOnInit() {
    this.initForm();
  }
 ngOnChanges(changes: SimpleChanges) {
    if (changes['categoria'] && this.categoriaForm) {
      if (this.categoria) {
        this.categoriaForm.patchValue({
          ...this.categoria,
        });
      } else {
        this.categoriaForm.reset();
      }
    }
  }
  

  private initForm() {
    this.categoriaForm = this.fb.group({
      nombre: ['', [Validators.required]],
    });

    if (this.isEdit && this.categoria) {
      this.categoriaForm.patchValue(this.categoria);
    }
  }

  onSubmit() {
    if (this.categoriaForm.valid) {
      const formData = this.categoriaForm.value;
      const categoriaData: Categoria = {
        ...formData,
        tipo: 'producto',
        id: this.categoria?.id
      };
      this.saveCategoria.emit(categoriaData);
      this.onClose();
    }
  }

  onClose() {
    this.categoriaForm.reset();
    this.closeModal.emit();
  }
}