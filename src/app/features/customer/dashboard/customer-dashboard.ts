import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';
import { BookingService } from '../../../core/services/booking.service';
import { OrderService } from '../../../core/services/order.service';
import { FoodOrder, Reservation } from '../../../core/models/restaurant.models';
import { ReceiptModal } from '../../../shared/components/receipt-modal';

@Component({
  selector: 'app-customer-dashboard',
  imports: [CommonModule, RouterLink, MatIconModule, ReceiptModal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <!-- Welcome Hero Banner -->
      <div class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#193529] via-[#244B3B] to-[#2f5f4b] text-white p-6 sm:p-10 shadow-xl border border-white/10">
        <!-- Background Ambient Accents -->
        <div class="absolute -right-10 -bottom-10 w-96 h-96 bg-[#C5A059]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute right-12 top-6 hidden lg:block opacity-15 pointer-events-none">
          <mat-icon class="text-[180px] text-white">dinner_dining</mat-icon>
        </div>

        <div class="relative z-10 max-w-2xl">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-[#DFC48A] font-semibold mb-4">
            <mat-icon class="text-sm">stars</mat-icon>
            <span>Exclusive Guest Hospitality</span>
          </div>

          <h1 class="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#FAF9F5] leading-tight">
            Welcome back, <span class="text-[#DFC48A]">{{ customerName() }}</span>
          </h1>

          <p class="mt-3 text-stone-200 text-sm sm:text-base leading-relaxed">
            Experience Michelin-inspired culinary craft, bespoke cellar pairings, and seamless table hospitality at Aura Table & Bar.
          </p>

          <!-- Quick Action Buttons -->
          <div class="mt-6 flex flex-wrap gap-3">
            <a
              routerLink="/customer/booking"
              class="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#DFC48A] to-[#C5A059] text-[#193529] font-bold text-sm shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
            >
              <mat-icon class="text-lg">table_restaurant</mat-icon>
              <span>Reserve a Table</span>
            </a>
            <a
              routerLink="/customer/menu"
              class="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-sm backdrop-blur-md transition-all duration-200"
            >
              <mat-icon class="text-lg">menu_book</mat-icon>
              <span>Order Food Menu</span>
            </a>
          </div>
        </div>
      </div>

      <!-- Quick Metrics Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Metric 1: Total Reservations -->
        <div class="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold text-stone-500 uppercase tracking-wider">My Reservations</p>
            <p class="text-2xl font-bold text-[#244B3B] mt-1">{{ myReservations().length }}</p>
            <p class="text-xs text-stone-500 mt-0.5">
              {{ activeBookingCount() }} upcoming booking{{ activeBookingCount() === 1 ? '' : 's' }}
            </p>
          </div>
          <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-[#244B3B] flex items-center justify-center">
            <mat-icon class="text-2xl">event_seat</mat-icon>
          </div>
        </div>

        <!-- Metric 2: Food Orders -->
        <div class="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold text-stone-500 uppercase tracking-wider">Total Orders</p>
            <p class="text-2xl font-bold text-[#244B3B] mt-1">{{ myOrders().length }}</p>
            <p class="text-xs text-stone-500 mt-0.5">
              {{ activeOrderCount() }} currently active
            </p>
          </div>
          <div class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <mat-icon class="text-2xl">receipt_long</mat-icon>
          </div>
        </div>

        <!-- Metric 3: Total Spent -->
        <div class="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold text-stone-500 uppercase tracking-wider">Total Dining Spent</p>
            <p class="text-2xl font-bold text-[#244B3B] mt-1">&dollar;{{ totalSpent().toFixed(2) }}</p>
            <p class="text-xs text-stone-500 mt-0.5">Across all visits</p>
          </div>
          <div class="w-12 h-12 rounded-2xl bg-[#C5A059]/10 text-[#9E7D36] flex items-center justify-center">
            <mat-icon class="text-2xl">payments</mat-icon>
          </div>
        </div>

        <!-- Metric 4: Aura Privilege Tier -->
        <div class="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold text-stone-500 uppercase tracking-wider">Hospitality Tier</p>
            <p class="text-2xl font-bold text-[#C5A059] mt-1">Connoisseur</p>
            <p class="text-xs text-emerald-700 font-semibold mt-0.5">Priority Seating Active</p>
          </div>
          <div class="w-12 h-12 rounded-2xl bg-[#244B3B]/10 text-[#244B3B] flex items-center justify-center">
            <mat-icon class="text-2xl">workspace_premium</mat-icon>
          </div>
        </div>
      </div>

      <!-- Promotional Seasonal Banner -->
      <div class="rounded-2xl bg-[#FAF9F5] border border-[#C5A059]/30 p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-[#C5A059]/20 text-[#244B3B] flex items-center justify-center shrink-0">
            <mat-icon class="text-2xl text-[#C5A059]">wine_bar</mat-icon>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#244B3B] text-white">Special Event</span>
              <h3 class="text-base font-bold text-stone-900">Autumn Harvest & Grand Cru Sommelier Pairing</h3>
            </div>
            <p class="text-xs text-stone-600 mt-1">
              Join Chef Antoine for an exclusive 6-course dining experience featuring black truffles and vintage Bordeaux. Available through November.
            </p>
          </div>
        </div>
        <a
          routerLink="/customer/booking"
          class="shrink-0 px-4 py-2 rounded-xl text-xs font-bold bg-[#244B3B] text-white hover:bg-[#193529] transition-colors"
        >
          Reserve Evening Table &rarr;
        </a>
      </div>

      <!-- Two Column Layout: Recent Reservations & Recent Orders -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <!-- Left: Recent Reservations -->
        <div class="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-sm flex flex-col">
          <div class="flex items-center justify-between pb-4 border-b border-stone-100">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg bg-emerald-50 text-[#244B3B] flex items-center justify-center">
                <mat-icon class="text-base">event_available</mat-icon>
              </div>
              <h2 class="text-base font-bold text-stone-900">Recent Table Bookings</h2>
            </div>
            <a routerLink="/customer/reservations" class="text-xs font-semibold text-[#244B3B] hover:text-[#C5A059] transition-colors">
              View All ({{ myReservations().length }}) &rarr;
            </a>
          </div>

          <div class="divide-y divide-stone-100 flex-1">
            @if (myReservations().length === 0) {
              <div class="py-12 text-center">
                <mat-icon class="text-4xl text-stone-300">event_busy</mat-icon>
                <p class="text-sm font-semibold text-stone-600 mt-2">No reservations yet</p>
                <p class="text-xs text-stone-400 mt-1">Book your table now to enjoy fine dining with us.</p>
                <a routerLink="/customer/booking" class="mt-4 inline-block px-4 py-2 rounded-xl text-xs font-bold bg-[#244B3B] text-white">
                  Book Table
                </a>
              </div>
            } @else {
              @for (res of myReservations().slice(0, 3); track res.id) {
                <div class="py-4 flex items-center justify-between gap-3">
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="font-mono text-xs font-bold text-[#244B3B]">{{ res.id }}</span>
                      <span
                        class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                        [ngClass]="{
                          'bg-emerald-100 text-emerald-800': res.status === 'Confirmed',
                          'bg-amber-100 text-amber-800': res.status === 'Pending',
                          'bg-stone-100 text-stone-700': res.status === 'Completed',
                          'bg-rose-100 text-rose-800': res.status === 'Cancelled' || res.status === 'Rejected'
                        }"
                      >
                        {{ res.status }}
                      </span>
                    </div>
                    <p class="text-sm font-semibold text-stone-800 mt-1">
                      Table {{ res.tableNumber }} &bull; {{ res.guests }} Guests
                    </p>
                    <p class="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                      <mat-icon class="text-xs text-stone-400">calendar_today</mat-icon>
                      <span>{{ res.date }} at {{ res.timeSlot }}</span>
                    </p>
                  </div>

                  <div class="flex items-center gap-2">
                    <button
                      type="button"
                      (click)="viewPass(res)"
                      class="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#244B3B] bg-emerald-50 hover:bg-emerald-100 transition-colors flex items-center gap-1"
                      title="View Pass"
                    >
                      <mat-icon class="text-sm">confirmation_number</mat-icon>
                      <span>Pass</span>
                    </button>
                  </div>
                </div>
              }
            }
          </div>
        </div>

        <!-- Right: Recent Food Orders -->
        <div class="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-sm flex flex-col">
          <div class="flex items-center justify-between pb-4 border-b border-stone-100">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center">
                <mat-icon class="text-base">soup_kitchen</mat-icon>
              </div>
              <h2 class="text-base font-bold text-stone-900">Recent Food Orders</h2>
            </div>
            <a routerLink="/customer/orders" class="text-xs font-semibold text-[#244B3B] hover:text-[#C5A059] transition-colors">
              View All ({{ myOrders().length }}) &rarr;
            </a>
          </div>

          <div class="divide-y divide-stone-100 flex-1">
            @if (myOrders().length === 0) {
              <div class="py-12 text-center">
                <mat-icon class="text-4xl text-stone-300">takeout_dining</mat-icon>
                <p class="text-sm font-semibold text-stone-600 mt-2">No food orders yet</p>
                <p class="text-xs text-stone-400 mt-1">Explore our culinary menu and place an order.</p>
                <a routerLink="/customer/menu" class="mt-4 inline-block px-4 py-2 rounded-xl text-xs font-bold bg-[#244B3B] text-white">
                  View Menu
                </a>
              </div>
            } @else {
              @for (ord of myOrders().slice(0, 3); track ord.id) {
                <div class="py-4 flex items-center justify-between gap-3">
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="font-mono text-xs font-bold text-stone-900">#{{ ord.id }}</span>
                      <span
                        class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                        [ngClass]="{
                          'bg-amber-100 text-amber-800': ord.status === 'Received' || ord.status === 'Preparing',
                          'bg-blue-100 text-blue-800': ord.status === 'Confirmed',
                          'bg-emerald-100 text-emerald-800': ord.status === 'Ready' || ord.status === 'Delivered',
                          'bg-rose-100 text-rose-800': ord.status === 'Cancelled'
                        }"
                      >
                        {{ ord.status }}
                      </span>
                      <span class="text-[10px] text-stone-400 font-medium">({{ ord.deliveryType }})</span>
                    </div>

                    <p class="text-xs text-stone-600 mt-1 truncate max-w-xs">
                      {{ formatOrderItems(ord) }}
                    </p>

                    <p class="text-xs font-semibold text-[#244B3B] mt-0.5">
                      &dollar;{{ ord.total.toFixed(2) }} &bull; <span class="text-stone-400 font-normal">{{ ord.orderDate | date:'shortTime' }}</span>
                    </p>
                  </div>

                  <div class="flex items-center gap-2">
                    <button
                      type="button"
                      (click)="viewReceipt(ord)"
                      class="px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors flex items-center gap-1"
                      title="View Receipt"
                    >
                      <mat-icon class="text-sm">receipt</mat-icon>
                      <span>Receipt</span>
                    </button>
                  </div>
                </div>
              }
            }
          </div>
        </div>

      </div>

    </div>

    <!-- Printable Receipt / Reservation Pass Modal -->
    @if (selectedReceiptOrder() || selectedPassReservation()) {
      <app-receipt-modal
        [order]="selectedReceiptOrder()"
        [reservation]="selectedPassReservation()"
        (closeModal)="clearModal()"
      />
    }
  `
})
export class CustomerDashboard {
  readonly authService = inject(AuthService);
  readonly bookingService = inject(BookingService);
  readonly orderService = inject(OrderService);

  readonly selectedReceiptOrder = signal<FoodOrder | null>(null);
  readonly selectedPassReservation = signal<Reservation | null>(null);

  readonly customerName = computed(() => this.authService.currentUser()?.name || 'Valued Guest');

  readonly myReservations = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return [];
    return this.bookingService.getByCustomerId(user.id);
  });

  readonly myOrders = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return [];
    return this.orderService.getByCustomerId(user.id);
  });

  readonly activeBookingCount = computed(() => {
    return this.myReservations().filter(r => r.status === 'Confirmed' || r.status === 'Pending').length;
  });

  readonly activeOrderCount = computed(() => {
    return this.myOrders().filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length;
  });

  readonly totalSpent = computed(() => {
    return this.myOrders()
      .filter(o => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + o.total, 0);
  });

  formatOrderItems(order: FoodOrder): string {
    return order.items.map(i => `${i.quantity}x ${i.name}`).join(', ');
  }

  viewReceipt(order: FoodOrder): void {
    this.selectedPassReservation.set(null);
    this.selectedReceiptOrder.set(order);
  }

  viewPass(res: Reservation): void {
    this.selectedReceiptOrder.set(null);
    this.selectedPassReservation.set(res);
  }

  clearModal(): void {
    this.selectedReceiptOrder.set(null);
    this.selectedPassReservation.set(null);
  }
}
