import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { OrderService } from '../../../core/services/order.service';
import { FoodOrder, OrderStatus } from '../../../core/models/restaurant.models';
import { ReceiptModal } from '../../../shared/components/receipt-modal';

@Component({
  selector: 'app-admin-orders',
  imports: [CommonModule, MatIconModule, ReceiptModal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#244B3B]/10 text-[#244B3B] text-xs font-semibold mb-2">
            <mat-icon class="text-sm">soup_kitchen</mat-icon>
            <span>Kitchen Display System (KDS)</span>
          </div>
          <h1 class="font-serif-luxury text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
            Food Order & Kitchen Dispatch
          </h1>
          <p class="text-stone-600 text-sm mt-1">
            Track line items, advance kitchen order statuses, manage tableside deliveries, and review receipts.
          </p>
        </div>

        <!-- Kitchen Status Filter Tabs -->
        <div class="flex items-center gap-1 bg-white p-1 rounded-2xl border border-stone-200 shadow-sm overflow-x-auto">
          @for (tab of tabs; track tab.id) {
            <button
              type="button"
              (click)="activeTab.set(tab.id)"
              class="px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap"
              [class.bg-[#244B3B]]="activeTab() === tab.id"
              [class.text-[#DFC48A]]="activeTab() === tab.id"
              [class.text-stone-600]="activeTab() !== tab.id"
              [class.hover:text-stone-900]="activeTab() !== tab.id"
            >
              {{ tab.label }}
              @if (tab.count() > 0) {
                <span class="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px]"
                  [class.bg-[#C5A059]]="activeTab() === tab.id"
                  [class.text-[#193529]]="activeTab() === tab.id"
                  [class.bg-stone-200]="activeTab() !== tab.id"
                  [class.text-stone-700]="activeTab() !== tab.id"
                >
                  {{ tab.count() }}
                </span>
              }
            </button>
          }
        </div>
      </div>

      <!-- Orders Stream -->
      @if (filteredOrders().length === 0) {
        <div class="bg-white rounded-3xl border border-stone-200 p-12 text-center max-w-md mx-auto shadow-sm">
          <mat-icon class="text-5xl text-stone-300">done_all</mat-icon>
          <h3 class="text-base font-bold text-stone-800 mt-3">No orders in this queue</h3>
          <p class="text-xs text-stone-500 mt-1">Select another tab to inspect previous completed or cancelled orders.</p>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (ord of filteredOrders(); track ord.id) {
            <div
              class="bg-white rounded-3xl border border-stone-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
              [class.border-l-4]="true"
              [class.border-l-amber-500]="ord.status === 'Received'"
              [class.border-l-blue-500]="ord.status === 'Confirmed'"
              [class.border-l-purple-500]="ord.status === 'Preparing'"
              [class.border-l-emerald-500]="ord.status === 'Ready' || ord.status === 'Delivered'"
              [class.border-l-rose-500]="ord.status === 'Cancelled'"
            >
              <!-- Order Header -->
              <div class="p-5 pb-4 border-b border-stone-100">
                <div class="flex items-start justify-between">
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="font-mono text-base font-bold text-stone-900">#{{ ord.id }}</span>
                      <span
                        class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider"
                        [ngClass]="{
                          'bg-amber-100 text-amber-800': ord.status === 'Received',
                          'bg-blue-100 text-blue-800': ord.status === 'Confirmed',
                          'bg-purple-100 text-purple-800': ord.status === 'Preparing',
                          'bg-emerald-100 text-emerald-800': ord.status === 'Ready' || ord.status === 'Delivered',
                          'bg-rose-100 text-rose-800': ord.status === 'Cancelled'
                        }"
                      >
                        {{ ord.status }}
                      </span>
                    </div>

                    <p class="text-xs font-semibold text-[#244B3B] mt-1">
                      {{ ord.deliveryType }}
                      @if (ord.tableNumber) {
                        &bull; <span class="underline">Table {{ ord.tableNumber }}</span>
                      }
                    </p>
                  </div>

                  <!-- Receipt Button -->
                  <button
                    type="button"
                    (click)="viewReceipt(ord)"
                    class="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                    title="View Receipt"
                  >
                    <mat-icon class="text-base">receipt</mat-icon>
                  </button>
                </div>

                <div class="mt-2 text-xs text-stone-500 flex justify-between">
                  <span>Guest: <strong class="text-stone-800">{{ ord.customerName }}</strong></span>
                  <span>{{ ord.orderDate | date:'shortTime' }}</span>
                </div>
              </div>

              <!-- Itemized Dishes Section -->
              <div class="p-5 space-y-2 flex-1">
                <p class="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Courses Ordered ({{ ord.items.length }})</p>
                <div class="space-y-2">
                  @for (item of ord.items; track item.foodId) {
                    <div class="flex items-center justify-between text-xs bg-stone-50 p-2 rounded-xl">
                      <div class="flex items-center gap-2">
                        <span class="w-5 h-5 rounded-md bg-[#244B3B] text-white flex items-center justify-center font-bold text-[10px]">
                          {{ item.quantity }}
                        </span>
                        <span class="font-semibold text-stone-800">{{ item.name }}</span>
                      </div>
                      <span class="font-mono text-stone-600">&dollar;{{ (item.price * item.quantity).toFixed(2) }}</span>
                    </div>
                  }
                </div>

                @if (ord.notes) {
                  <div class="p-2.5 rounded-xl bg-amber-50 text-[11px] text-amber-900 border border-amber-200/60 mt-2">
                    <span class="font-bold">Instructions:</span> "{{ ord.notes }}"
                  </div>
                }
              </div>

              <!-- Card Footer: Total & Status Advance Controls -->
              <div class="p-5 pt-3 border-t border-stone-100 bg-[#FAF9F5] space-y-3">
                <div class="flex justify-between items-center text-xs">
                  <span class="text-stone-500 font-medium">Order Total:</span>
                  <span class="font-mono text-base font-bold text-[#244B3B]">&dollar;{{ ord.total.toFixed(2) }}</span>
                </div>

                <!-- Admin Status Action Buttons -->
                <div class="flex items-center gap-2">
                  <div class="flex-1">
                    <select
                      [value]="ord.status"
                      (change)="onStatusSelect(ord.id, $event)"
                      class="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-stone-800 text-xs font-semibold focus:ring-2 focus:ring-[#244B3B] outline-none cursor-pointer"
                    >
                      @for (st of allStatuses; track st) {
                        <option [value]="st">{{ st }}</option>
                      }
                    </select>
                  </div>

                  <!-- Quick Next Step Button -->
                  @if (getNextStatus(ord.status); as next) {
                    <button
                      type="button"
                      (click)="updateStatus(ord.id, next)"
                      class="px-3 py-2 rounded-xl text-xs font-bold bg-[#244B3B] hover:bg-[#193529] text-white transition-colors shrink-0 shadow-sm"
                      title="Advance to next step"
                    >
                      &rarr; {{ next }}
                    </button>
                  }
                </div>
              </div>

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
export class AdminOrders {
  readonly orderService = inject(OrderService);

  readonly activeTab = signal<'all' | 'kitchen' | 'ready' | 'delivered' | 'cancelled'>('kitchen');
  readonly selectedReceipt = signal<FoodOrder | null>(null);

  readonly allStatuses: OrderStatus[] = [
    'Received', 'Confirmed', 'Preparing', 'Ready', 'Delivered', 'Cancelled'
  ];

  readonly tabs = [
    { id: 'kitchen' as const, label: 'Active Kitchen', count: computed(() => this.orderService.activeKitchenOrders().length) },
    { id: 'ready' as const, label: 'Ready for Service', count: computed(() => this.orderService.readyOrders().length) },
    { id: 'all' as const, label: 'All Orders', count: computed(() => this.orderService.totalOrders()) },
    { id: 'delivered' as const, label: 'Delivered', count: computed(() => this.orderService.orders().filter(o => o.status === 'Delivered').length) },
    { id: 'cancelled' as const, label: 'Cancelled', count: computed(() => this.orderService.orders().filter(o => o.status === 'Cancelled').length) }
  ];

  readonly filteredOrders = computed(() => {
    const list = this.orderService.orders();
    const tab = this.activeTab();

    switch (tab) {
      case 'kitchen':
        return list.filter(o => o.status === 'Received' || o.status === 'Confirmed' || o.status === 'Preparing');
      case 'ready':
        return list.filter(o => o.status === 'Ready');
      case 'delivered':
        return list.filter(o => o.status === 'Delivered');
      case 'cancelled':
        return list.filter(o => o.status === 'Cancelled');
      case 'all':
      default:
        return list;
    }
  });

  getNextStatus(current: OrderStatus): OrderStatus | null {
    switch (current) {
      case 'Received': return 'Confirmed';
      case 'Confirmed': return 'Preparing';
      case 'Preparing': return 'Ready';
      case 'Ready': return 'Delivered';
      default: return null;
    }
  }

  updateStatus(id: string, status: OrderStatus): void {
    this.orderService.updateOrderStatus(id, status);
  }

  onStatusSelect(id: string, event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.updateStatus(id, select.value as OrderStatus);
  }

  viewReceipt(order: FoodOrder): void {
    this.selectedReceipt.set(order);
  }
}
