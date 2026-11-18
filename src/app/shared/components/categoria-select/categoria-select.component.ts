import { Component, OnInit, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoriasStateService } from '../../../admin/services/categorias-state.service';
import { Categoria } from '../../../admin/interfaces/categoria.interface';

@Component({
  selector: 'app-categoria-select',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div [formGroup]="categoriaForm" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700">
          Categoría
          @if (filteredCategorias.length === 0) {
            <span class="text-sm text-amber-600">(No hay categorías disponibles)</span>
          }
        </label>
        <select formControlName="id_categoria"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-orange focus:ring-brand-orange">
          <option value="">Seleccionar categoría</option>
          @for (categoria of filteredCategorias; track categoria.id) {
            <option [value]="categoria.id">{{ categoria.nombre }}</option>
          }
        </select>
      </div>
    </div>
  `
})
export class CategoriaSelectComponent implements OnInit {
  @Output() categoriaChange = new EventEmitter<number>();

  private fb = inject(FormBuilder);
  private categoriasState = inject(CategoriasStateService);
  
  categoriaForm!: FormGroup;
  protected categorias = this.categoriasState.state;
  protected get filteredCategorias(): Categoria[] {
    return this.categorias().categorias.filter(categoria => categoria.tipo === 'producto');
  }

  ngOnInit() {
    this.initForm();
    this.categoriasState.refreshData();
  }

  private initForm() {
    this.categoriaForm = this.fb.group({
      id_categoria: ['', Validators.required]
    });

    this.categoriaForm.get('id_categoria')?.valueChanges.subscribe(id => {
      if (id) {
        this.categoriaChange.emit(Number(id));
      }
    });
  }
}