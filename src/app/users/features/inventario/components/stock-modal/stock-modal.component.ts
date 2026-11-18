import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { StockProducto } from '../../interfaces/stock.interface';
import { PriceUtils } from '../../../../../shared/utils/price.utils';

@Component({
  selector: 'app-stock-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './stock-modal.component.html'
})
export class StockModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() item: any = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() saveItem = new EventEmitter<{ tipo: 'producto'; data: StockProducto }>();

  private fb = inject(FormBuilder);
  stockForm: FormGroup = this.fb.group({
    stock: [0, [Validators.required, Validators.min(0)]],
    precio: [0, [Validators.required, Validators.min(0)]]
  });

  ngOnChanges(changes: SimpleChanges) {
    if (changes['item'] && this.item) {
      this.stockForm.patchValue({
        stock: 0,
        precio: this.item.precioCompra ?? 0
      });
    }
  }

  onSubmit() {
    if (this.stockForm.invalid || !this.item?.id) {
      this.stockForm.markAllAsTouched();
      return;
    }

    const { stock, precio } = this.stockForm.getRawValue();
    this.saveItem.emit({
      tipo: 'producto',
      data: {
        stock: Number(stock),
        precio: PriceUtils.toApi(Number(precio)),
        contable: true,
        id_producto: this.item.id
      }
    });
    this.onClose();
  }

  onClose() {
    this.stockForm.reset({ stock: 0, precio: 0 });
    this.closeModal.emit();
  }
}
