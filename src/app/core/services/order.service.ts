import { Injectable, computed, inject, signal } from '@angular/core';
import { FoodOrder, OrderItem, OrderStatus } from '../models/restaurant.models';
import { INITIAL_ORDERS } from '../models/mock-data';
import { StorageService } from './storage.service';
import { ToastService } from './toast.service';
import { CartService } from './cart.service';

const ORDERS_STORAGE_KEY = 'aura_orders_v1';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private storage = inject(StorageService);
  private toast = inject(ToastService);
  private cartService = inject(CartService);

  private readonly _orders = signal<FoodOrder[]>([]);
  readonly orders = this._orders.asReadonly();

  readonly totalOrders = computed(() => this._orders().length);

  readonly totalRevenue = computed(() => {
    const raw = this._orders()
      .filter(o => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + o.total, 0);
    return Math.round(raw * 100) / 100;
  });

  readonly activeKitchenOrders = computed(() => {
    return this._orders().filter(o => o.status === 'Received' || o.status === 'Confirmed' || o.status === 'Preparing');
  });

  readonly readyOrders = computed(() => {
    return this._orders().filter(o => o.status === 'Ready');
  });

  constructor() {
    this.initOrders();
  }

  private initOrders(): void {
    const saved = this.storage.getItem<FoodOrder[]>(ORDERS_STORAGE_KEY, INITIAL_ORDERS);
    this._orders.set(saved);
  }

  private saveOrders(): void {
    this.storage.setItem(ORDERS_STORAGE_KEY, this._orders());
  }

  getOrderById(id: string): FoodOrder | undefined {
    return this._orders().find(o => o.id === id);
  }

  getByCustomerId(customerId: string): FoodOrder[] {
    return this._orders().filter(o => o.customerId === customerId);
  }

  placeOrder(params: {
    customerId: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    deliveryType: 'Dine-In' | 'Takeaway' | 'Delivery';
    tableNumber?: string;
    notes?: string;
    paymentMethod: 'Credit Card' | 'Cash on Dine-in' | 'Digital Wallet';
  }): { success: boolean; order?: FoodOrder; error?: string } {
    const cartItems = this.cartService.items();
    if (cartItems.length === 0) {
      const err = 'Your cart is empty. Please add items to place an order.';
      this.toast.showError('Cart Empty', err);
      return { success: false, error: err };
    }

    const items: OrderItem[] = cartItems.map(ci => ({
      foodId: ci.foodItem.id,
      name: ci.foodItem.name,
      price: ci.foodItem.price,
      quantity: ci.quantity,
      category: ci.foodItem.category,
      image: ci.foodItem.image
    }));

    const subtotal = this.cartService.subtotal();
    const tax = this.cartService.tax();
    const total = this.cartService.total();

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newOrder: FoodOrder = {
      id: `ORD-${randomNum}`,
      customerId: params.customerId,
      customerName: params.customerName,
      customerEmail: params.customerEmail,
      customerPhone: params.customerPhone,
      items,
      subtotal,
      tax,
      total,
      orderDate: new Date().toISOString(),
      status: 'Received',
      deliveryType: params.deliveryType,
      tableNumber: params.tableNumber,
      notes: params.notes,
      paymentStatus: 'Paid',
      paymentMethod: params.paymentMethod
    };

    this._orders.update(list => [newOrder, ...list]);
    this.saveOrders();
    this.cartService.clearCart();

    this.toast.showSuccess(
      'Order Placed Successfully!',
      `Order #${newOrder.id} (${items.length} items, $${total.toFixed(2)}) has been submitted to the kitchen.`
    );

    return { success: true, order: newOrder };
  }

  updateOrderStatus(orderId: string, newStatus: OrderStatus): void {
    const order = this.getOrderById(orderId);
    if (!order) return;

    this._orders.update(list => list.map(o => {
      if (o.id === orderId) {
        return { ...o, status: newStatus };
      }
      return o;
    }));
    this.saveOrders();

    this.toast.showSuccess('Order Status Updated', `Order #${orderId} marked as ${newStatus}.`);
  }

  cancelOrder(orderId: string): void {
    const order = this.getOrderById(orderId);
    if (!order) return;

    if (order.status === 'Delivered' || order.status === 'Ready') {
      this.toast.showWarning('Cannot Cancel', 'This order is already prepared and cannot be cancelled.');
      return;
    }

    this._orders.update(list => list.map(o => {
      if (o.id === orderId) {
        return { ...o, status: 'Cancelled' };
      }
      return o;
    }));
    this.saveOrders();
    this.toast.showInfo('Order Cancelled', `Order #${orderId} has been cancelled.`);
  }
}
