import { Component, EventEmitter, Input, OnInit, inject, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SubCategoria } from '../../interfaces/subcategoria.interface';
import { CategoriaSelectComponent } from '../../../shared/components/categoria-select/categoria-select.component';


@Component({
  selector: 'app-sucursal-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CategoriaSelectComponent],
  templateUrl: './subcategoria-modal.component.html'
})
export class SucursalModalComponent implements OnInit {
  @Input() isOpen = false;
  @Input() isEdit = false;
  @Input() categoria: SubCategoria | null = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() saveCategoria = new EventEmitter<SubCategoria>();

  private fb = inject(FormBuilder);
  categoriaForm!: FormGroup;

  protected currentCategoriaId?: number;

  ngOnInit() {
    this.initForm();
  }

  private initForm() {
    this.categoriaForm = this.fb.group({
      nombre: ['', Validators.required]
    });

    if (this.isEdit && this.categoria) {
      this.categoriaForm.patchValue({
        nombre: this.categoria.nombre
      });
    }
  }

  onCategoriaChange(categoriaId: number) {
    this.currentCategoriaId = categoriaId;
  }

  onSubmit() {
    if (this.categoriaForm.valid && this.currentCategoriaId) {
      const categoriaData: SubCategoria = {
        ...this.categoriaForm.value,
        id: this.categoria?.id,
        tipo: 'producto',
        id_categoria: this.currentCategoriaId
      };
      this.saveCategoria.emit(categoriaData);
      this.onClose();
    }
  }

  onClose() {
    this.categoriaForm.reset();
    this.currentCategoriaId = undefined;
    this.closeModal.emit();
  }
}

