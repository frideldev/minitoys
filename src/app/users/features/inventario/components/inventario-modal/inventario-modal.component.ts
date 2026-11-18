import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoriasStateService } from '../../../../../admin/services/categorias-state.service';
import { SubCategoriasStateService } from '../../../../../admin/services/subcategorias-state.service';
import { SubCategoria } from '../../../../../admin/interfaces/subcategoria.interface';
import { Categoria } from '../../../../../admin/interfaces/categoria.interface';
import { LugarStateService } from '../../../../../admin/services/lugar-state.service';

@Component({
  selector: 'app-inventario-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './inventario-modal.component.html'
})
export class InventarioModalComponent implements OnInit, OnChanges {
  @Input() isOpen = false;
  @Input() isEdit = false;
  @Input() item: any = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() saveItem = new EventEmitter<{ tipo: 'producto'; data: FormData }>();

  private fb = inject(FormBuilder);
  private categoriasState = inject(CategoriasStateService);
  private lugarState = inject(LugarStateService);
  private subcategoriasState = inject(SubCategoriasStateService);

  inventarioForm!: FormGroup;
  selectedFile: File | null = null;
  currentImageUrl: string | null = null;
  protected state = this.categoriasState.state;
  protected statesubcategoria = this.subcategoriasState.state;
  protected lugaresState = this.lugarState.state;

  protected get categoriasFiltradas(): Categoria[] {
    return this.state().categorias.filter(categoria => categoria.tipo === 'producto');
  }

  protected get subcategoriasFiltradas(): SubCategoria[] {
    const categoriaId = this.inventarioForm?.get('categoria_id')?.value;
    if (!categoriaId) return [];

    return this.statesubcategoria().categorias.filter(
      subcategoria => Number(subcategoria.id_categoria) === Number(categoriaId)
    );
  }

  ngOnInit() {
    this.initForm();
    this.categoriasState.refreshData();
    this.subcategoriasState.refreshData();
    this.lugarState.refreshData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['item'] && this.inventarioForm) {
      if (this.item) {
        this.currentImageUrl = this.normalizeImageUrl(this.item.imagen);
        this.inventarioForm.patchValue({ ...this.item, tipo: 'producto' }, { emitEvent: false });
        if (this.isEdit) {
          this.inventarioForm.get('stock_global_actual')?.disable({ emitEvent: false });
        } else {
          this.inventarioForm.get('stock_global_actual')?.enable({ emitEvent: false });
        }
      } else {
        this.currentImageUrl = null;
        this.inventarioForm.reset(this.emptyProduct());
        this.inventarioForm.get('stock_global_actual')?.enable({ emitEvent: false });
      }
    }
  }

  private initForm() {
    this.inventarioForm = this.fb.group({
      tipo: ['producto', Validators.required],
      codigo: ['', Validators.required],
      descripcion: ['', Validators.required],
      id_lugar: ['', Validators.required],
      categoria_id: ['', Validators.required],
      sub_categoria_id: ['', Validators.required],
      id_sucursal: [1, Validators.required],
      stock_global_actual: [{ value: 0, disabled: false }, [Validators.required, Validators.min(0)]],
      stock_global_minimo: [0, [Validators.required, Validators.min(0)]],
      precioCompra: [0, [Validators.required, Validators.min(0)]],
      precioVenta: [0, [Validators.required, Validators.min(0)]],
      visibilidad: [1],
      actualizacion: [new Date().toISOString().split('T')[0], Validators.required]
    });
  }

  private emptyProduct() {
    return {
      tipo: 'producto',
      codigo: '',
      descripcion: '',
      id_lugar: '',
      categoria_id: '',
      sub_categoria_id: '',
      id_sucursal: 1,
      stock_global_actual: 0,
      stock_global_minimo: 0,
      precioCompra: 0,
      precioVenta: 0,
      visibilidad: 1,
      actualizacion: new Date().toISOString().split('T')[0]
    };
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
  }

  getFilePreview(): string {
    return this.selectedFile ? URL.createObjectURL(this.selectedFile) : '';
  }

  onSubmit() {
    if (this.inventarioForm.invalid) {
      this.inventarioForm.markAllAsTouched();
      return;
    }

    const formValue = this.inventarioForm.getRawValue();
    const formData = new FormData();
    Object.entries(formValue).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        const apiValue = key === 'precioCompra' || key === 'precioVenta'
          ? Number((Number(value) * 100).toFixed(2))
          : value;
        formData.append(key, String(apiValue));
      }
    });
    if (this.selectedFile) {
      formData.append('imagen', this.selectedFile);
    }

    this.saveItem.emit({ tipo: 'producto', data: formData });
    this.onClose();
  }

  onClose() {
    this.inventarioForm.reset(this.emptyProduct());
    this.selectedFile = null;
    this.currentImageUrl = null;
    this.closeModal.emit();
  }

  private normalizeImageUrl(imagePath: string | null): string | null {
    if (!imagePath) return null;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    const baseUrl = 'https://testbackend.merakisys.com/public/';
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    return `${baseUrl}${cleanPath}`;
  }
}
