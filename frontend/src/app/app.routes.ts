import { Routes } from '@angular/router';
import { FridgeListComponent } from './fridge-list/fridge-list.component';
import { ProductListComponent } from './product-list/product-list.component';
import { LowStockComponent } from './low-stock/low-stock.component';

export const routes: Routes = [
  { path: '', redirectTo: '/fridges', pathMatch: 'full' },
  { path: 'fridges', component: FridgeListComponent },
  { path: 'fridges/:id/products', component: ProductListComponent },
  { path: 'low-stock', component: LowStockComponent },
];
