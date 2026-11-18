import { Component, EventEmitter, Input, OnInit, SimpleChanges, inject, OnChanges, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Lugar } from '../../interfaces/lugar.interface';

@Component({
  selector: 'app-lugar-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './lugar-modal.component.html'
})
export class LugarModalComponent implements OnInit, OnChanges {
  @Input() isOpen = false;
  @Input() isEdit = false;
  @Input() lugar: Lugar | null = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() saveLugar = new EventEmitter<Lugar>();

  private fb = inject(FormBuilder);
  lugarForm!: FormGroup;

  ngOnInit() {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['lugar'] && this.lugarForm) {
      if (this.lugar) {
        this.lugarForm.patchValue(this.lugar);
      } else {
        this.lugarForm.reset();
      }
    }
  }

  private initForm() {
    this.lugarForm = this.fb.group({
      nombre: ['', [Validators.required,Validators.minLength(2)]]
    });

    if (this.isEdit && this.lugar) {
      this.lugarForm.patchValue(this.lugar);
    }
  }

  onSubmit() {
    if (this.lugarForm.valid) {
      const lugarData: Lugar = {
        ...this.lugarForm.value,
        id: this.lugar?.id
      };
      this.saveLugar.emit(lugarData);
      this.onClose();
    }
  }

  onClose() {
    this.lugarForm.reset();
    this.closeModal.emit();
  }
}