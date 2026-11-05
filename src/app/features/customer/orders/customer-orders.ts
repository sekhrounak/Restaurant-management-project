import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { OrderService } from '../../../core/services/order.service';
import { AuthService } from '../../../core/services/auth.service';
import { FoodOrder, OrderStatus } from '../../../core/models/restaurant.models';
import { ReceiptModal } from '../../../shared/components/receipt-modal';

@Component({
  selector: 'app-customer-orders',
  imports: [CommonModule, RouterLink, MatIconModule, ReceiptModal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#244B3B]/10 text-[#244B3B] text-xs font-semibold mb-2">
            <mat-icon class="text-sm">receipt_long</mat-icon>
            <span>Food Order History</span>
          </div>
          <h1 class="font-serif-luxury text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
            My Dining Orders
          </h1>
          <p class="text-stone-600 text-sm mt-1">
            Track real-time kitchen preparation, view itemized dishes, and download dining receipts.
          </p>
        </div>

        <a
          routerLink="/customer/menu"
          class="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#244B3B] text-[#FAF9F5] font-bold text-xs shadow-md hover:bg-[#193529] transition-all self-start sm:self-auto"
        >
          <mat-icon class="text-base text-[#DFC48A]">add_shopping_cart</mat-icon>
          <span>Order From Menu</span>
        </a>
      </div>

      <!-- Orders List -->
      @if (myOrders().length === 0) {
        <div class="bg-white rounded-3xl border border-stone-200 p-12 text-center max-w-md mx-auto shadow-sm my-8">
          <div class="w-16 h-16 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-4">
            <mat-icon class="text-4xl">takeout_dining</mat-icon>
          </div>
          <h3 class="font-serif-luxury text-2xl font-bold text-stone-800">No Orders Placed Yet</h3>
          <p class="text-xs text-stone-500 mt-2 leading-relaxed">
            Browse our artisanal starters, flame-grilled steaks, handcrafted pastas, and cellar cocktails.
          </p>
          <a
            routerLink="/customer/menu"
            class="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#244B3B] text-white font-bold text-xs shadow-md"
          >
            <span>Browse Full Menu</span>
            <mat-icon class="text-sm">arrow_forward</mat-icon>
          </a>
        </div>
      } @else {
        <div class="space-y-6">
          @for (order of myOrders(); track order.id) {
            <div class="bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden p-6 sm:p-7 space-y-6">
              
              <!-- Order Header -->
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 rounded-2xl bg-[#244B3B] text-[#DFC48A] flex items-center justify-center font-bold font-mono">
                    <mat-icon>dinner_dining</mat-icon>
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="font-mono text-base font-bold text-stone-900">#{{ order.id }}</span>
                      <span
                        class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                        [ngClass]="{
                          'bg-amber-100 text-amber-800': order.status === 'Received' || order.status === 'Preparing',
                          'bg-blue-100 text-blue-800': order.status === 'Confirmed',
                          'bg-purple-100 text-purple-800': order.status === 'Ready',
                          'bg-emerald-100 text-emerald-800': order.status === 'Delivered',
                          'bg-rose-100 text-rose-800': order.status === 'Cancelled'
                        }"
                      >
                        {{ order.status }}
                      </span>
                    </div>
                    <p class="text-xs text-stone-500 mt-0.5">
                      {{ order.orderDate | date:'medium' }} &bull; {{ order.deliveryType }}
                      @if (order.tableNumber) {
                        &bull; <span class="font-semibold text-stone-700">Table {{ order.tableNumber }}</span>
                      }
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-4 self-end sm:self-auto">
                  <div class="text-right">
                    <span class="text-[10px] text-stone-400 uppercase font-semibold block">Total Bill</span>
                    <span class="text-lg font-mono font-bold text-[#244B3B]">&dollar;{{ order.total.toFixed(2) }}</span>
                  </div>

                  <button
                    type="button"
                    (click)="viewReceipt(order)"
                    class="px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <mat-icon class="text-base text-stone-600">receipt</mat-icon>
                    <span>View Folio</span>
                  </button>
                </div>
              </div>

              <!-- Live Kitchen Status Stepper (if active order) -->
              @if (order.status !== 'Cancelled') {
                <div class="bg-[#FAF9F5] p-4 rounded-2xl border border-stone-200/70">
                  <div class="flex items-center justify-between text-xs font-semibold mb-2">
                    <span class="text-stone-500">Preparation Lifecycle</span>
                    <span class="text-[#244B3B] font-bold">{{ getStatusLabel(order.status) }}</span>
                  </div>

                  <div class="grid grid-cols-5 gap-2 relative">
                    @for (step of statusSteps; track step; let idx = $index) {
                      @let isCompleted = isStepCompleted(order.status, step);
                      @let isCurrent = order.status === step;

                      <div class="flex flex-col items-center text-center">
                        <div
                          class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                          [class.bg-[#244B3B]]="isCompleted"
                          [class.text-[#DFC48A]]="isCompleted"
                          [class.ring-2]="isCurrent"
                          [class.ring-[#C5A059]]="isCurrent"
                          [class.bg-stone-200]="!isCompleted"
                          [class.text-stone-500]="!isCompleted"
                        >
                          @if (isCompleted && !isCurrent) {
                            <mat-icon class="text-xs">check</mat-icon>
                          } @else {
                            {{ idx + 1 }}
                          }
                        </div>
                        <span
                          class="text-[10px] mt-1 font-medium hidden sm:inline"
                          [class.text-stone-900]="isCurrent || isCompleted"
                          [class.font-bold]="isCurrent"
                          [class.text-stone-400]="!isCompleted"
                        >
                          {{ step }}
                        </span>
                      </div>
                    }
                  </div>
                </div>
              }

              <!-- Itemized Food Items List -->
              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                @for (item of order.items; track item.foodId) {
                  <div class="flex items-center gap-3 p-2.5 rounded-xl bg-stone-50 border border-stone-200/70">
                    <img
                      [src]="item.image"
                      [alt]="item.name"
                      class="w-12 h-12 rounded-lg object-cover border border-stone-200 shrink-0"
                      referrerpolicy="no-referrer"
                    />
                    <div class="min-w-0 flex-1">
                      <p class="text-xs font-bold text-stone-900 truncate">{{ item.name }}</p>
                      <p class="text-[11px] text-stone-500 flex justify-between mt-0.5">
                        <span>Qty: {{ item.quantity }}</span>
                        <span class="font-mono font-semibold">&dollar;{{ (item.price * item.quantity).toFixed(2) }}</span>
                      </p>
                    </div>
                  </div>
                }
              </div>

              @if (order.notes) {
                <div class="p-3 bg-amber-50/70 rounded-xl border border-amber-200/50 text-xs text-amber-900">
                  <span class="font-bold">Kitchen Request:</span> "{{ order.notes }}"
                </div>
              }

            </div>
          }
        </div>
      }

    </div>

    <!-- Receipt Modal -->
    @if (selectedReceipt()) {
      <app-receipt-modal
        [order]="selectedReceipt()"
        (closeModal)="selectedReceipt.set(null)"
      />
    }
  `
})
export class CustomerOrders {
  readonly orderService = inject(OrderService);
  readonly authService = inject(AuthService);

  readonly selectedReceipt = signal<FoodOrder | null>(null);

  readonly statusSteps: OrderStatus[] = ['Received', 'Confirmed', 'Preparing', 'Ready', 'Delivered'];

  readonly myOrders = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return [];
    return this.orderService.getByCustomerId(user.id);
  });

  getStatusLabel(status: OrderStatus): string {
    switch (status) {
      case 'Received': return 'Order received by culinary brigade';
      case 'Confirmed': return 'Kitchen confirmed and prepping ingredients';
      case 'Preparing': return 'Cooking over wood fire hearth';
      case 'Ready': return 'Plated & awaiting tableside service';
      case 'Delivered': return 'Served to your table / Completed';
      case 'Cancelled': return 'Cancelled';
    }
  }

  isStepCompleted(current: OrderStatus, step: OrderStatus): boolean {
    const order = ['Received', 'Confirmed', 'Preparing', 'Ready', 'Delivered'];
    const currentIdx = order.indexOf(current);
    const stepIdx = order.indexOf(step);
    if (currentIdx === -1 || stepIdx === -1) return false;
    return currentIdx >= stepIdx;
  }

  viewReceipt(order: FoodOrder): void {
    this.selectedReceipt.set(order);
  }
}
