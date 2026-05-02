import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService, Product } from '../api.service';
import { ChangeDetectorRef } from '@angular/core'; // add this

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  fridgeId!: number;
  fridgeName: string = '';
  products: Product[] = [];
  newProduct: Partial<Product> = { name: '', quantity: 0, expiry_date: null };
  editingProduct: Product | null = null;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.fridgeId = idParam ? +idParam : 0;
    console.log('ProductListComponent: fridgeId =', this.fridgeId);
    if (this.fridgeId) {
      this.api.getFridgeById(this.fridgeId).subscribe(fridge => {
        this.fridgeName = fridge.name;
        this.cdr.detectChanges();
      })
      this.loadProducts();
    }
  }

  loadProducts(): void {
    console.log('Calling API for fridgeId:', this.fridgeId);
    this.api.getProductsByFridge(this.fridgeId).subscribe({
      next: (data) => {
        console.log('Products received:', data);
        this.products = data;
        this.cdr.detectChanges(); // force update
      },
      error: (err) => console.error('Error fetching products:', err)
    });
  }

  addProduct(): void {
    if (!this.newProduct.name?.trim()) return;
    const  productToAdd = {
      fridge_id: this.fridgeId,
      name: this.newProduct.name,
      quantity: this.newProduct.quantity !== undefined ? this.newProduct.quantity : 0,
      expiry_date: this.newProduct.expiry_date || null
    };
    this.api.createProduct(productToAdd).subscribe((() => {
      this.loadProducts();
      this.newProduct = { name: '', quantity: 0, expiry_date: '' };
    }))
  }

  startEdit(product: Product): void {
    this.editingProduct = { ...product };
  }

  updateProduct(): void {
    if (!this.editingProduct) return;
    this.api.updateProduct(this.editingProduct.id, this.editingProduct).subscribe((result) => {
      this.loadProducts();
      this.editingProduct = null;
    });
  }

  cancelEdit(): void {
    this.editingProduct = null;
  }

  deleteProduct(id: number): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.api.deleteProduct(id).subscribe(() => this.loadProducts());
    }
  }
}
