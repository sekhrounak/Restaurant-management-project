import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { BookingService } from '../../../core/services/booking.service';
import { OrderService } from '../../../core/services/order.service';
import { TableService } from '../../../core/services/table.service';
import { CustomerService } from '../../../core/services/customer.service';
import { FoodService } from '../../../core/services/food.service';
import { OrderStatus } from '../../../core/models/restaurant.models';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, RouterLink, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <!-- Admin Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C5A059]/20 text-[#9E7D36] text-xs font-semibold mb-2">
            <mat-icon class="text-sm">admin_panel_settings</mat-icon>
            <span>Executive Command Center</span>
          </div>
          <h1 class="font-serif-luxury text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
            Restaurant Operations & Analytics
          </h1>
          <p class="text-stone-600 text-sm mt-1">
            Real-time telemetry on covers, kitchen throughput, revenue, and dining floor allocation.
          </p>
        </div>

        <!-- Quick Shortcut Actions -->
        <div class="flex flex-wrap items-center gap-2.5">
          <a
            routerLink="/admin/orders"
            class="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5"
          >
            <mat-icon class="text-base">soup_kitchen</mat-icon>
            <span>Live Kitchen ({{ orderService.activeKitchenOrders().length }})</span>
          </a>
          <a
            routerLink="/admin/reservations"
            class="px-4 py-2.5 rounded-xl bg-[#244B3B] hover:bg-[#193529] text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5"
          >
            <mat-icon class="text-base">event_note</mat-icon>
            <span>Bookings</span>
          </a>
        </div>
      </div>

      <!-- 6-Metric Executive KPIs Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        
        <!-- Total Revenue -->
        <div class="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Total Revenue</span>
            <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <mat-icon class="text-base">payments</mat-icon>
            </div>
          </div>
          <div class="mt-3">
            <p class="text-2xl font-bold font-mono text-[#244B3B]">&dollar;{{ orderService.totalRevenue().toFixed(2) }}</p>
            <p class="text-[11px] text-emerald-700 font-semibold mt-0.5">+14.2% vs last week</p>
          </div>
        </div>

        <!-- Total Food Orders -->
        <div class="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Total Orders</span>
            <div class="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center">
              <mat-icon class="text-base">receipt_long</mat-icon>
            </div>
          </div>
          <div class="mt-3">
            <p class="text-2xl font-bold text-stone-900">{{ orderService.totalOrders() }}</p>
            <p class="text-[11px] text-amber-700 font-semibold mt-0.5">
              {{ orderService.activeKitchenOrders().length }} in preparation
            </p>
          </div>
        </div>

        <!-- Today's Bookings -->
        <div class="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Today's Bookings</span>
            <div class="w-8 h-8 rounded-lg bg-[#C5A059]/20 text-[#9E7D36] flex items-center justify-center">
              <mat-icon class="text-base">today</mat-icon>
            </div>
          </div>
          <div class="mt-3">
            <p class="text-2xl font-bold text-[#C5A059]">{{ bookingService.todayBookingsCount() }}</p>
            <p class="text-[11px] text-stone-500 mt-0.5">Evening seatings</p>
          </div>
        </div>

        <!-- Total Reservations -->
        <div class="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold text-stone-500 uppercase tracking-wider">All Bookings</span>
            <div class="w-8 h-8 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center">
              <mat-icon class="text-base">event_seat</mat-icon>
            </div>
          </div>
          <div class="mt-3">
            <p class="text-2xl font-bold text-stone-900">{{ bookingService.totalReservations() }}</p>
            <p class="text-[11px] text-stone-500 mt-0.5">
              {{ bookingService.confirmedCount() }} confirmed
            </p>
          </div>
        </div>

        <!-- Tables Available -->
        <div class="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Available Tables</span>
            <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <mat-icon class="text-base">check_box</mat-icon>
            </div>
          </div>
          <div class="mt-3">
            <p class="text-2xl font-bold text-emerald-700">{{ tableService.availableTablesCount() }} / {{ tableService.totalTables() }}</p>
            <p class="text-[11px] text-stone-500 mt-0.5">
              {{ tableService.totalSeatingCapacity() }} total seats
            </p>
          </div>
        </div>

        <!-- Registered Customers -->
        <div class="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Guests / VIPs</span>
            <div class="w-8 h-8 rounded-lg bg-purple-50 text-purple-800 flex items-center justify-center">
              <mat-icon class="text-base">group</mat-icon>
            </div>
          </div>
          <div class="mt-3">
            <p class="text-2xl font-bold text-stone-900">{{ customerService.totalCustomersCount() }}</p>
            <p class="text-[11px] text-purple-700 font-semibold mt-0.5">Active diners</p>
          </div>
        </div>

      </div>

      <!-- Dashboard Visual Analytics & Live Kitchen Board -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        <!-- Left: Live Kitchen Order Stream (7 Cols) -->
        <div class="lg:col-span-7 bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 space-y-5">
          <div class="flex items-center justify-between pb-3 border-b border-stone-100">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <mat-icon class="text-base">soup_kitchen</mat-icon>
              </div>
              <div>
                <h2 class="text-base font-bold text-stone-900">Live Kitchen Order Queue</h2>
                <p class="text-xs text-stone-500">Orders requiring immediate culinary attention</p>
              </div>
            </div>
            <a routerLink="/admin/orders" class="text-xs font-bold text-[#244B3B] hover:text-[#C5A059]">
              Full Kitchen Dispatch &rarr;
            </a>
          </div>

          <div class="divide-y divide-stone-100">
            @if (orderService.activeKitchenOrders().length === 0) {
              <div class="py-8 text-center text-stone-400">
                <mat-icon class="text-4xl text-stone-300">done_all</mat-icon>
                <p class="text-xs font-medium mt-1">Kitchen board clear &bull; No pending orders right now.</p>
              </div>
            } @else {
              @for (ord of orderService.activeKitchenOrders(); track ord.id) {
                <div class="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="font-mono text-xs font-bold text-stone-900">#{{ ord.id }}</span>
                      <span
                        class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                        [ngClass]="{
                          'bg-amber-100 text-amber-800 animate-pulse': ord.status === 'Received',
                          'bg-blue-100 text-blue-800': ord.status === 'Confirmed',
                          'bg-purple-100 text-purple-800': ord.status === 'Preparing'
                        }"
                      >
                        {{ ord.status }}
                      </span>
                      <span class="text-xs font-semibold text-[#244B3B]">
                        {{ ord.deliveryType }} {{ ord.tableNumber ? '(Table ' + ord.tableNumber + ')' : '' }}
                      </span>
                    </div>

                    <p class="text-xs font-semibold text-stone-800 mt-1">
                      {{ ord.customerName }} &bull; {{ ord.items.length }} dishes &bull; &dollar;{{ ord.total.toFixed(2) }}
                    </p>

                    <div class="flex flex-wrap gap-1.5 mt-2">
                      @for (item of ord.items; track item.foodId) {
                        <span class="px-2 py-0.5 rounded-lg bg-stone-100 text-[11px] text-stone-700 font-medium">
                          {{ item.quantity }}x {{ item.name }}
                        </span>
                      }
                    </div>
                  </div>

                  <!-- Quick Next Status Button -->
                  <div class="flex items-center gap-2 shrink-0">
                    @if (ord.status === 'Received') {
                      <button
                        type="button"
                        (click)="advanceStatus(ord.id, 'Confirmed')"
                        class="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                      >
                        Confirm
                      </button>
                    } @else if (ord.status === 'Confirmed') {
                      <button
                        type="button"
                        (click)="advanceStatus(ord.id, 'Preparing')"
                        class="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition-colors"
                      >
                        Start Cooking
                      </button>
                    } @else if (ord.status === 'Preparing') {
                      <button
                        type="button"
                        (click)="advanceStatus(ord.id, 'Ready')"
                        class="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                      >
                        Ready to Serve
                      </button>
                    }
                  </div>
                </div>
              }
            }
          </div>
        </div>

        <!-- Right: Floor Occupancy & Quick Stats (5 Cols) -->
        <div class="lg:col-span-5 space-y-6">
          
          <!-- Dining Floor Capacity Card -->
          <div class="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-stone-100">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-xl bg-emerald-100 text-[#244B3B] flex items-center justify-center">
                  <mat-icon class="text-base">table_restaurant</mat-icon>
                </div>
                <h2 class="text-base font-bold text-stone-900">Floor Occupancy</h2>
              </div>
              <a routerLink="/admin/table-management" class="text-xs font-bold text-[#244B3B] hover:text-[#C5A059]">
                Manage Tables &rarr;
              </a>
            </div>

            <div class="grid grid-cols-2 gap-3 text-center">
              <div class="p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                <p class="text-xs font-bold text-emerald-800 uppercase">Available</p>
                <p class="text-2xl font-bold text-[#244B3B] mt-1">{{ tableService.availableTablesCount() }}</p>
                <p class="text-[10px] text-emerald-600">Ready for walk-in</p>
              </div>
              <div class="p-3 bg-amber-50 rounded-2xl border border-amber-100">
                <p class="text-xs font-bold text-amber-800 uppercase">Occupied / Booked</p>
                <p class="text-2xl font-bold text-amber-800 mt-1">
                  {{ tableService.occupiedTablesCount() + tableService.reservedTablesCount() }}
                </p>
                <p class="text-[10px] text-amber-600">Active seatings</p>
              </div>
            </div>

            <!-- Visual Bar -->
            <div>
              <div class="flex justify-between text-xs font-semibold text-stone-600 mb-1">
                <span>Occupancy Rate</span>
                <span>{{ occupancyRate() }}%</span>
              </div>
              <div class="w-full h-3 rounded-full bg-stone-100 overflow-hidden flex">
                <div
                  class="bg-[#244B3B] transition-all duration-500"
                  [style.width.%]="occupancyRate()"
                ></div>
              </div>
            </div>
          </div>

          <!-- Fast Management Nav Links -->
          <div class="bg-gradient-to-br from-[#193529] to-[#244B3B] rounded-3xl p-6 text-white shadow-xl border border-white/10 space-y-4">
            <h3 class="font-serif-luxury text-xl font-bold text-[#FAF9F5]">Administrative Tools</h3>
            <p class="text-xs text-stone-300">Direct access to restaurant configuration modules:</p>

            <div class="grid grid-cols-2 gap-2.5 pt-1">
              <a
                routerLink="/admin/menu-management"
                class="p-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-semibold flex items-center gap-2 transition-colors"
              >
                <mat-icon class="text-base text-[#DFC48A]">restaurant_menu</mat-icon>
                <span>Edit Food Menu</span>
              </a>
              <a
                routerLink="/admin/table-management"
                class="p-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-semibold flex items-center gap-2 transition-colors"
              >
                <mat-icon class="text-base text-[#DFC48A]">grid_view</mat-icon>
                <span>Floor Layout</span>
              </a>
              <a
                routerLink="/admin/reservations"
                class="p-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-semibold flex items-center gap-2 transition-colors"
              >
                <mat-icon class="text-base text-[#DFC48A]">event_note</mat-icon>
                <span>All Reservations</span>
              </a>
              <a
                routerLink="/admin/customers"
                class="p-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-semibold flex items-center gap-2 transition-colors"
              >
                <mat-icon class="text-base text-[#DFC48A]">group</mat-icon>
                <span>Guest Directory</span>
              </a>
            </div>
          </div>

        </div>

      </div>

    </div>
  `
})
export class AdminDashboard {
  readonly bookingService = inject(BookingService);
  readonly orderService = inject(OrderService);
  readonly tableService = inject(TableService);
  readonly customerService = inject(CustomerService);
  readonly foodService = inject(FoodService);

  readonly occupancyRate = computed(() => {
    const total = this.tableService.totalTables();
    if (total === 0) return 0;
    const taken = this.tableService.occupiedTablesCount() + this.tableService.reservedTablesCount();
    return Math.round((taken / total) * 100);
  });

  advanceStatus(orderId: string, nextStatus: OrderStatus): void {
    this.orderService.updateOrderStatus(orderId, nextStatus);
  }
}
