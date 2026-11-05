import { Injectable, computed, inject, signal } from '@angular/core';
import { CartItem, FoodItem } from '../models/restaurant.models';
import { StorageService } from './storage.service';
import { ToastService } from './toast.service';

const CART_STORAGE_KEY = 'aura_cart_v1';
const TAX_RATE = 0.085; // 8.5%

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private storage = inject(StorageService);
  private toast = inject(ToastService);

  private readonly _items = signal<CartItem[]>([]);
  readonly items = this._items.asReadonly();

  readonly totalItemCount = computed(() => {
    return this._items().reduce((sum, item) => sum + item.quantity, 0);
  });

  readonly subtotal = computed(() => {
    const raw = this._items().reduce((sum, item) => sum + (item.foodItem.price * item.quantity), 0);
    return Math.round(raw * 100) / 100;
  });

  readonly tax = computed(() => {
    return Math.round(this.subtotal() * TAX_RATE * 100) / 100;
  });

  readonly total = computed(() => {
    return Math.round((this.subtotal() + this.tax()) * 100) / 100;
  });

  constructor() {
    this.initCart();
  }

  private initCart(): void {
    const saved = this.storage.getItem<CartItem[]>(CART_STORAGE_KEY, []);
    this._items.set(saved);
  }

  private saveCart(): void {
    this.storage.setItem(CART_STORAGE_KEY, this._items());
  }

  addItem(food: FoodItem, quantity = 1, specialInstructions?: string): void {
    if (!food.isAvailable) {
      this.toast.showWarning('Item Unavailable', `${food.name} is currently out of stock.`);
      return;
    }

    const current = this._items();
    const existingIndex = current.findIndex(i => i.foodItem.id === food.id);

    if (existingIndex > -1) {
      const updated = [...current];
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: updated[existingIndex].quantity + quantity,
        specialInstructions: specialInstructions || updated[existingIndex].specialInstructions
      };
      this._items.set(updated);
    } else {
      this._items.set([...current, { foodItem: food, quantity, specialInstructions }]);
    }

    this.saveCart();
    this.toast.showSuccess('Added to Cart', `${quantity}x ${food.name} added to your order.`);
  }

  updateQuantity(foodId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(foodId);
      return;
    }

    this._items.update(list => list.map(item => {
      if (item.foodItem.id === foodId) {
        return { ...item, quantity };
      }
      return item;
    }));
    this.saveCart();
  }

  removeItem(foodId: string): void {
    const item = this._items().find(i => i.foodItem.id === foodId);
    this._items.update(list => list.filter(i => i.foodItem.id !== foodId));
    this.saveCart();
    if (item) {
      this.toast.showInfo('Removed', `${item.foodItem.name} removed from order.`);
    }
  }

  clearCart(): void {
    this._items.set([]);
    this.saveCart();
  }
}
