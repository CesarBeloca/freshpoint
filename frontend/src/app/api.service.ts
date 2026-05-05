import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Fridge {
  id: number;
  name: string;
  location: string;
}

export interface Product {
  id: number;
  fridge_id: number;
  name: string;
  quantity: number;
  expiry_date: string | null;
}

export interface LowStockProduct extends Product {
  fridge_name: string;
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = 'https://freshpoint.onrender.com/api';

  constructor(private http: HttpClient) {}

  // Fridges
  getFridges(): Observable<Fridge[]> {
    return this.http.get<Fridge[]>(`${this.baseUrl}/fridges`);
  }
  getFridgeById(id: number): Observable<Fridge> {
    return this.http.get<Fridge>(`${this.baseUrl}/fridges/${id}`);
  }
  createFridge(data: Partial<Fridge>): Observable<Fridge> {
    return this.http.post<Fridge>(`${this.baseUrl}/fridges`, data);
  }
  updateFridge(id: number, data: Partial<Fridge>): Observable<Fridge> {
    return this.http.put<Fridge>(`${this.baseUrl}/fridges/${id}`, data);
  }
  deleteFridge(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/fridges/${id}`);
  }

  // Products
  getProductsByFridge(fridgeId: number): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/fridges/${fridgeId}/products`);
  }
  createProduct(data: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(`${this.baseUrl}/products`, data);
  }
  updateProduct(id: number, data: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.baseUrl}/products/${id}`, data);
  }
  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/products/${id}`);
  }
  getLowStock(): Observable<LowStockProduct[]> {
    return this.http.get<LowStockProduct[]>(`${this.baseUrl}/products/low-stock`);
  }
}
