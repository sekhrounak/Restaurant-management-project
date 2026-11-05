import { Injectable, computed, inject, signal } from '@angular/core';
import { FoodCategory, FoodItem } from '../models/restaurant.models';
import { INITIAL_FOOD_ITEMS } from '../models/mock-data';
import { StorageService } from './storage.service';
import { ToastService } from './toast.service';

const FOOD_STORAGE_KEY = 'aura_food_items_v1';

@Injectable({
  providedIn: 'root'
})
export class FoodService {
  private storage = inject(StorageService);
  private toast = inject(ToastService);

  private readonly _foodItems = signal<FoodItem[]>([]);
  readonly foodItems = this._foodItems.asReadonly();

  readonly categories: FoodCategory[] = ['Starters', 'Main Course', 'Pizza', 'Burgers', 'Drinks', 'Desserts'];

  readonly totalItemsCount = computed(() => this._foodItems().length);
  readonly availableItemsCount = computed(() => this._foodItems().filter(f => f.isAvailable).length);

  constructor() {
    this.initFood();
  }

  private initFood(): void {
    const saved = this.storage.getItem<FoodItem[]>(FOOD_STORAGE_KEY, INITIAL_FOOD_ITEMS);
    this._foodItems.set(saved);
  }

  private saveFood(): void {
    this.storage.setItem(FOOD_STORAGE_KEY, this._foodItems());
  }

  getItemById(id: string): FoodItem | undefined {
    return this._foodItems().find(f => f.id === id);
  }

  addFood(itemData: Omit<FoodItem, 'id'>): FoodItem {
    const newItem: FoodItem = {
      ...itemData,
      id: 'food_' + Date.now().toString(36)
    };
    this._foodItems.update(list => [newItem, ...list]);
    this.saveFood();
    this.toast.showSuccess('Dish Added', `${newItem.name} has been added to ${newItem.category}.`);
    return newItem;
  }

  updateFood(updatedItem: FoodItem): void {
    this._foodItems.update(list => list.map(f => f.id === updatedItem.id ? updatedItem : f));
    this.saveFood();
    this.toast.showSuccess('Menu Updated', `${updatedItem.name} has been updated.`);
  }

  deleteFood(id: string): void {
    const item = this.getItemById(id);
    this._foodItems.update(list => list.filter(f => f.id !== id));
    this.saveFood();
    this.toast.showInfo('Item Removed', `${item?.name ?? 'Dish'} was removed from the menu.`);
  }

  toggleAvailability(id: string): void {
    const item = this.getItemById(id);
    if (!item) return;
    const newStatus = !item.isAvailable;
    this._foodItems.update(list => list.map(f => f.id === id ? { ...f, isAvailable: newStatus } : f));
    this.saveFood();
    if (newStatus) {
      this.toast.showSuccess('Item In Stock', `${item.name} is now available to order.`);
    } else {
      this.toast.showWarning('Item Marked 86\'d', `${item.name} is now marked as unavailable.`);
    }
  }
}
