import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CategoriasStateService } from '../../../../../admin/services/categorias-state.service';
import { LugarStateService } from '../../../../../admin/services/lugar-state.service';
import { SubCategoriasStateService } from '../../../../../admin/services/subcategorias-state.service';
import { InventarioModalComponent } from './inventario-modal.component';

describe('InventarioModalComponent', () => {
  let component: InventarioModalComponent;
  let fixture: ComponentFixture<InventarioModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventarioModalComponent],
      providers: [
        {
          provide: CategoriasStateService,
          useValue: {
            state: () => ({ categorias: [] }),
            refreshData: jasmine.createSpy('refreshData')
          }
        },
        {
          provide: SubCategoriasStateService,
          useValue: {
            state: () => ({ categorias: [] }),
            refreshData: jasmine.createSpy('refreshData')
          }
        },
        {
          provide: LugarStateService,
          useValue: {
            state: () => ({ lugares: [] }),
            refreshData: jasmine.createSpy('refreshData')
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InventarioModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('emits the required product fields as FormData when registration is valid', () => {
    component.inventarioForm.setValue({
      tipo: 'producto',
      codigo: 'PROD-001',
      descripcion: 'Muñeca',
      id_lugar: 3,
      categoria_id: 4,
      sub_categoria_id: 5,
      id_sucursal: 1,
      stock_global_actual: 0,
      stock_global_minimo: 0,
      precioCompra: 12.5,
      precioVenta: 21.99,
      visibilidad: 1,
      actualizacion: '2026-10-07'
    });
    const savedItems: Array<{ tipo: 'producto'; data: FormData }> = [];
    component.saveItem.subscribe(item => savedItems.push(item));

    component.onSubmit();

    expect(savedItems.length).toBe(1);
    expect(savedItems[0].tipo).toBe('producto');
    const data = savedItems[0].data;
    expect(data.get('descripcion')).toBe('Muñeca');
    expect(data.get('precioCompra')).toBe('1250');
    expect(data.get('precioVenta')).toBe('2199');
    expect(data.get('stock_global_actual')).toBe('0');
    expect(data.get('stock_global_minimo')).toBe('0');
    expect(data.get('actualizacion')).toBe('2026-10-07');
    expect(data.get('id_sucursal')).toBe('1');
    expect(data.get('id_lugar')).toBe('3');
    expect(data.get('categoria_id')).toBe('4');
    expect(data.get('sub_categoria_id')).toBe('5');
  });

  it('does not emit product data when a required field is missing', () => {
    const savedItems: Array<{ tipo: 'producto'; data: FormData }> = [];
    component.saveItem.subscribe(item => savedItems.push(item));

    component.onSubmit();

    expect(savedItems).toHaveSize(0);
  });
});
