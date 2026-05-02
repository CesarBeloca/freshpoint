import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, LowStockProduct } from '../api.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-low-stock',
  imports: [CommonModule, RouterLink],
  templateUrl: './low-stock.component.html',
  styleUrl: './low-stock.component.css',
})
export class LowStockComponent implements OnInit {
  lowStockProducts: LowStockProduct[] = [];

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.api.getLowStock().subscribe((data) => {
      console.log('Low Stock data: ',data);
      this.lowStockProducts = data;
      this.cdr.detectChanges()
    });
  }
}
