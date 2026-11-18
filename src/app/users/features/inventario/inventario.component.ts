import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { LayoutComponent } from "../../../shared/ui/layout/layout.component";
import { InventarioStateService } from './services/inventario-state.service';
import { InventarioModalComponent } from './components/inventario-modal/inventario-modal.component';
import { StockModalComponent } from './components/stock-modal/stock-modal.component';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { TodosInventario } from './interfaces/inventario.interface';
import { StockStateService } from './services/stock-state.service';
import { CategoriasStateService } from '../../../admin/services/categorias-state.service';
import { SubCategoriasStateService } from '../../../admin/services/subcategorias-state.service';
import { Categoria } from '../../../admin/interfaces/categoria.interface';
import { SubCategoria } from '../../../admin/interfaces/subcategoria.interface';
import { LugarStateService } from '../../../admin/services/lugar-state.service';
import { PriceUtils } from '../../../shared/utils/price.utils';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LayoutComponent,
    InventarioModalComponent,
    StockModalComponent
  ],
  templateUrl: './inventario.component.html',
})
export class InventarioComponent implements OnInit {
  private inventarioState = inject(InventarioStateService);
  private stockState = inject(StockStateService);
  private categoriasState = inject(CategoriasStateService);
  private subcategoriasState = inject(SubCategoriasStateService);
  private lugarState = inject(LugarStateService);
  private authService = inject(AuthService);
  private http = inject(HttpClient);
  protected state = this.inventarioState.state;
  protected categoriasState$ = this.categoriasState.state; 
  protected subcategoriasState$ = this.subcategoriasState.state;
  protected lugarState$ = this.lugarState.state;
  showModal = false;
  showCatalogModal = false;
  catalogError: string | null = null;
  catalogLoading = false;
  catalogSearchControl = new FormControl('', { nonNullable: true });
  catalogSelectedCategories = new Set<number>();
  catalogSelectedSubcategories = new Set<number>();
  catalogExpanded = new Set<number>();
  isEdit = false;
  selectedItem: any = null;
  searchControl = new FormControl('');
  selectedProduct: any = null;
  showImageModal = false;
  showStockModal = false;

  ngOnInit() {
    this.loadInventario();
    this.setupSearch();
    this.categoriasState.refreshData();
    this.subcategoriasState.refreshData();
    this.lugarState.refreshData();
  }

  protected get catalogCategorias(): Categoria[] {
    return this.categoriasState$().categorias.filter(categoria => categoria.tipo === 'producto');
  }

  protected subcategoriasDe(categoria: Categoria): SubCategoria[] {
    return this.subcategoriasState$().categorias.filter(
      sub => Number(sub.id_categoria) === Number(categoria.id)
    );
  }

  protected get filteredCatalogCategorias(): Categoria[] {
    const term = this.catalogSearchControl.value.trim().toLowerCase();
    if (!term) return this.catalogCategorias;
    return this.catalogCategorias.filter(categoria =>
      categoria.nombre.toLowerCase().includes(term) ||
      this.subcategoriasDe(categoria).some(sub => sub.nombre.toLowerCase().includes(term))
    );
  }

  protected visibleSubcategorias(categoria: Categoria): SubCategoria[] {
    const term = this.catalogSearchControl.value.trim().toLowerCase();
    const subs = this.subcategoriasDe(categoria);
    if (!term || categoria.nombre.toLowerCase().includes(term)) return subs;
    return subs.filter(sub => sub.nombre.toLowerCase().includes(term));
  }

  protected catalogCategoryState(categoria: Categoria): 'all' | 'some' | 'none' {
    const subs = this.subcategoriasDe(categoria);
    if (subs.length === 0) {
      return this.catalogSelectedCategories.has(Number(categoria.id)) ? 'all' : 'none';
    }
    const selected = subs.filter(sub => this.catalogSelectedSubcategories.has(Number(sub.id))).length;
    if (selected === 0) return 'none';
    return selected === subs.length ? 'all' : 'some';
  }

  protected get catalogAllSelected(): boolean {
    const categorias = this.catalogCategorias;
    return categorias.length > 0 && categorias.every(c => this.catalogCategoryState(c) === 'all');
  }

  protected get catalogSelectedCount(): { categorias: number; subcategorias: number } {
    return {
      categorias: this.catalogCategorias.filter(c => this.catalogCategoryState(c) !== 'none').length,
      subcategorias: this.catalogSelectedSubcategories.size
    };
  }

  protected get canGenerateCatalog(): boolean {
    return this.catalogSelectedCount.categorias > 0 && !!this.currentSucursalId && !this.catalogLoading;
  }

  protected get currentSucursalId(): number | null {
    const idSucursal = this.authService.getCurrentUser()?.id_sucursal;
    if (typeof idSucursal !== 'number' || !Number.isInteger(idSucursal) || idSucursal <= 0) {
      return null;
    }
    return idSucursal;
  }

  openCatalogModal(): void {
    this.catalogSelectedCategories.clear();
    this.catalogSelectedSubcategories.clear();
    this.catalogExpanded.clear();
    this.catalogSearchControl.setValue('');
    this.catalogError = null;
    this.showCatalogModal = true;
  }

  toggleCatalogAll(): void {
    const select = !this.catalogAllSelected;
    this.catalogCategorias.forEach(categoria => this.setCategory(categoria, select));
    this.catalogError = null;
  }

  toggleCatalogCategory(categoria: Categoria): void {
    this.setCategory(categoria, this.catalogCategoryState(categoria) !== 'all');
    this.catalogError = null;
  }

  protected isCatalogSubSelected(subcategoria: SubCategoria): boolean {
    return this.catalogSelectedSubcategories.has(Number(subcategoria.id));
  }

  toggleCatalogSubcategory(subcategoria: SubCategoria): void {
    const id = Number(subcategoria.id);
    if (this.catalogSelectedSubcategories.has(id)) {
      this.catalogSelectedSubcategories.delete(id);
    } else {
      this.catalogSelectedSubcategories.add(id);
    }
    this.catalogError = null;
  }

  toggleCatalogExpanded(categoria: Categoria): void {
    const id = Number(categoria.id);
    if (this.catalogExpanded.has(id)) {
      this.catalogExpanded.delete(id);
    } else {
      this.catalogExpanded.add(id);
    }
  }

  protected isCatalogExpanded(categoria: Categoria): boolean {
    return !!this.catalogSearchControl.value.trim() || this.catalogExpanded.has(Number(categoria.id));
  }

  private setCategory(categoria: Categoria, selected: boolean): void {
    const subs = this.subcategoriasDe(categoria);
    if (subs.length === 0) {
      const id = Number(categoria.id);
      selected ? this.catalogSelectedCategories.add(id) : this.catalogSelectedCategories.delete(id);
      return;
    }
    subs.forEach(sub => {
      const id = Number(sub.id);
      selected ? this.catalogSelectedSubcategories.add(id) : this.catalogSelectedSubcategories.delete(id);
    });
  }

  openCatalog(endpoint: 'htmlCatalogo' | 'getPdfCatalogo'): void {
    const idSucursal = this.currentSucursalId;

    if (!idSucursal) {
      this.catalogError = 'No se encontró una sucursal asociada a tu usuario.';
      return;
    }

    const included = this.catalogCategorias.filter(c => this.catalogCategoryState(c) !== 'none');
    if (included.length === 0) {
      this.catalogError = 'Selecciona al menos una categoría o subcategoría para continuar.';
      return;
    }

    const allCategories = included.length === this.catalogCategorias.length;
    const allSubcategories = included.every(c => this.catalogCategoryState(c) === 'all');

    const body = {
      catalogo: {
        sucursal_id: idSucursal,
        categoria_ids: allCategories ? '*' : included.map(c => Number(c.id)),
        subcategoria_ids: allSubcategories ? '*' : [...this.catalogSelectedSubcategories]
      },
      formato_catalogo: {
        color_primario: '#efa11f',
        color_secundario: '#8e4cff',
        sizeImage: 1,
        mostrar_nombre_categorias: false
      }
    };

    // Se abre la pestaña de forma síncrona para evitar el bloqueo de popups
    const newTab = window.open('', '_blank');
    this.catalogLoading = true;
    this.http.post(`${environment.API_URL}/v2/${endpoint}`, body, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        this.catalogLoading = false;
        const type = endpoint === 'getPdfCatalogo' ? 'application/pdf' : 'text/html';
        const url = URL.createObjectURL(new Blob([blob], { type }));
        if (newTab) {
          newTab.location.href = url;
        } else {
          window.open(url, '_blank');
        }
        setTimeout(() => URL.revokeObjectURL(url), 60000);
        this.showCatalogModal = false;
      },
      error: () => {
        this.catalogLoading = false;
        newTab?.close();
        this.catalogError = 'No se pudo generar el catálogo.';
      }
    });
  }

  private loadInventario() {
    this.inventarioState.refreshData();
  }

  private setupSearch() {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
    ).subscribe(value => {
      if (value) {
        this.inventarioState.searchInventario(value);
      } else {
        this.inventarioState.refreshData();
      }
    });
  }
  openNewModal() {
    this.isEdit = false;
    this.selectedItem = null;
    this.showModal = true;
  }

  openEditModal(item: any) {
    this.isEdit = true;
    this.selectedItem = { ...item };
    this.showModal = true;
  }

  onSaveItem(event: { tipo: string, data: any }) {
    if (event.tipo !== 'producto') {
      console.error('No se puede guardar: solo se permiten productos', event);
      return;
    }

    if (this.isEdit) {
      this.inventarioState.updateProducto(this.selectedItem.id, event.data);
    } else {
      this.inventarioState.createProducto(event.data);
    }
    this.showModal = false;
  }

  changePage(page: number) {
    this.inventarioState.changePage(page);
  }

  getVisiblePages(currentPage: number, totalPages: number): (number | null)[] {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const delta = 2;
    const pages: (number | null)[] = [1];
    const rangeStart = Math.max(2, currentPage - delta);
    const rangeEnd = Math.min(totalPages - 1, currentPage + delta);

    if (rangeStart > 2) pages.push(null);
    for (let i = rangeStart; i <= rangeEnd; i++) pages.push(i);
    if (rangeEnd < totalPages - 1) pages.push(null);
    pages.push(totalPages);
    return pages;
  }

  confirmDelete(item: TodosInventario) {
    if (item?.tipo?.toLowerCase() !== 'producto') {
      console.error('No se puede eliminar: solo se permiten productos', item);
      return;
    }
    if (confirm(`¿Está seguro de eliminar el producto "${item.descripcion}"?`)) {
      this.inventarioState.deleteProducto(item.id);
    }
  }

  getImageUrl(imagePath: string): string {
    if (!imagePath) return '';
    
    // Remove any existing paths and get just the filename part
    const cleanPath = imagePath
      .replace('storage/', '')
      .replace(/^.*[\\\/]/, '');
      
    const baseUrl = environment.API_URL.replace(/\/api$/, '');
    return `${baseUrl}/storage/productos/${cleanPath}`;
  }

  onRowSelect(item: any) {
    if (item.imagen) {
      item.imagen = this.getImageUrl(item.imagen);
    }
    this.selectedProduct = item;
  }

  toggleImageModal() {
    this.showImageModal = !this.showImageModal;
  }

  openStockModal(item: any) {
    this.selectedItem = item;
    this.isEdit = false;
    this.showStockModal = true;
  }

onSaveStock(event: { tipo: string; data: any }) {
    if (event.tipo !== 'producto') {
      console.error('No se puede actualizar el stock: solo se permiten productos', event);
      return;
    }
    this.stockState.createStockProducto(event.data);
    this.showStockModal = false;
    setTimeout(() => this.inventarioState.refreshData(), 1000);
  }

  getStockStatus(currentStock: number, minStock: number): 'danger' | 'warning' | 'success' {
    if (!currentStock || !minStock) return 'success';
    
    const stockWith20Percent = minStock + (minStock * 0.20); // 20% more than min stock
    const stockWith50Percent = minStock + (minStock * 0.50); // 50% more than min stock

    if (currentStock <= stockWith20Percent) {
        return 'danger';
    } else if (currentStock <= stockWith50Percent) {
        return 'warning';
    } else {
        return 'success';
    }
  }
  copyItem(item: TodosInventario) {
    if (item.tipo.toLowerCase() !== 'producto') {
      console.error('No se puede copiar: solo se permiten productos', item);
      return;
    }

    const confirmed = confirm(`¿Está seguro de copiar el item "${item.descripcion}"?`);

    if (!confirmed) return;

    const { id, imagen, ...itemCopy } = item;
    itemCopy.descripcion = `${itemCopy.descripcion} - Copia`;
    itemCopy.stock_global_actual = 0;
    itemCopy.stock_global_minimo = 0;
    itemCopy.id_sucursal = itemCopy.id_sucursal || 1;
    itemCopy.categoria_id = itemCopy.categoria_id || '';
    itemCopy.sub_categoria_id = itemCopy.sub_categoria_id || '';

    // Convertir precios de Bs → centavos (el backend espera ×100)
    const precioCompraApi = PriceUtils.toApi(itemCopy.precioCompra);
    const precioVentaApi  = PriceUtils.toApi(itemCopy.precioVenta);

    const productData = {
      ...itemCopy,
      precioCompra: precioCompraApi,
      precioVenta: precioVentaApi,
      actualizacion: itemCopy.actualizacion || new Date().toISOString().split('T')[0],
    };
    const formData = new FormData();
    Object.entries(productData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });
    this.inventarioState.createProducto(formData);
  }
getCategoriaNombre(categoriaId: number): string {
    const categoria = this.categoriasState$().categorias.find(cat => cat.id === categoriaId);
    return categoria?.nombre || 'Sin categoría';
  }
  getLugarNombre(lugarId: number): string {
    const lugar = this.lugarState$().lugares.find(lugar => lugar.id === lugarId);
    return lugar?.nombre || 'Sin lugar';
  }
}
