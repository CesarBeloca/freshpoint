import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService, Fridge } from '../api.service';

@Component({
  selector: 'app-fridge-list',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './fridge-list.component.html',
  styleUrl: './fridge-list.component.css',
})
export class FridgeListComponent implements OnInit {
  fridges: Fridge[] = [];
  newFridge: Partial<Fridge> = { name: '', location: '' };
  editingFridge: Fridge | null = null;

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.loadFridges();
  }

  loadFridges(): void {
    this.api.getFridges().subscribe(data => {
      console.log('Fridges received:', data);
      this.fridges = data;
      this.cdr.detectChanges();
    });
  }

  addFridge(): void {
    if (!this.newFridge.name?.trim() || !this.newFridge.location?.trim()) return;
    this.api.createFridge(this.newFridge).subscribe(() => {
      this.loadFridges();
      this.newFridge = { name: '', location: '' };
    });
  }

  startEdit(fridge: Fridge): void {
    this.editingFridge = { ...fridge };
  }

  updateFridge(): void {
    if (!this.editingFridge) return;
    this.api.updateFridge(this.editingFridge.id, this.editingFridge).subscribe(() => {
      this.loadFridges();
      (this.editingFridge = null);
    });
  }

  cancelEdit(): void {
    this.editingFridge = null;
  }

  deleteFridge(id: number): void {
    if (confirm('Delete this fridge? All products inside will also be deleted.')) {
      this.api.deleteFridge(id).subscribe(() => this.loadFridges());
    }
  }

  protected readonly length = length;
}
