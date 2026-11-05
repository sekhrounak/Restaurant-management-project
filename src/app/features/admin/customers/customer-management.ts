import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { CustomerService, CustomerSummary } from '../../../core/services/customer.service';
import { BookingService } from '../../../core/services/booking.service';
import { OrderService } from '../../../core/services/order.service';

@Component({
  selector: 'app-customer-management',
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#244B3B]/10 text-[#244B3B] text-xs font-semibold mb-2">
            <mat-icon class="text-sm">group</mat-icon>
            <span>Guest Relations & CRM</span>
          </div>
          <h1 class="font-serif-luxury text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
            Guest & Patron Directory
          </h1>
          <p class="text-stone-600 text-sm mt-1">
            Review guest dining histories, lifetime spend, loyalty metrics, and reservation frequency.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <div class="bg-white px-4 py-2 rounded-2xl border border-stone-200 shadow-sm text-center">
            <p class="text-[10px] text-stone-400 font-bold uppercase">Total Guests</p>
            <p class="text-lg font-bold text-stone-900">{{ customerService.totalCustomersCount() }}</p>
          </div>
        </div>
      </div>

      <!-- Search Input -->
      <div class="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-sm">
        <div class="relative max-w-md">
          <mat-icon class="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-lg">search</mat-icon>
          <input
            type="text"
            [value]="searchQuery()"
            (input)="onSearchInput($event)"
            placeholder="Search patron by name, email, or telephone..."
            class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 bg-[#FAF9F5] text-xs text-stone-900 focus:ring-2 focus:ring-[#244B3B] outline-none"
          />
        </div>
      </div>

      <!-- Customers Table -->
      <div class="bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-[#FAF9F5] border-b border-stone-200 text-stone-500 uppercase text-[11px] font-bold tracking-wider">
                <th class="py-4 px-6">Guest Profile</th>
                <th class="py-4 px-6">Contact Details</th>
                <th class="py-4 px-6 text-center">Reservations</th>
                <th class="py-4 px-6 text-center">Orders</th>
                <th class="py-4 px-6 text-right">Lifetime Spend</th>
                <th class="py-4 px-6">Registered</th>
                <th class="py-4 px-6 text-right">Activity</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-stone-100 text-xs">
              @for (cust of filteredCustomers(); track cust.id) {
                <tr class="hover:bg-stone-50/80 transition-colors">
                  
                  <!-- Guest Profile -->
                  <td class="py-4 px-6">
                    <div class="flex items-center gap-3">
                      <img
                        [src]="cust.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'"
                        [alt]="cust.name"
                        class="w-10 h-10 rounded-full object-cover border border-stone-200"
                        referrerpolicy="no-referrer"
                      />
                      <div>
                        <p class="font-bold text-stone-900 text-sm">{{ cust.name }}</p>
                        <span class="font-mono text-[10px] text-stone-400">ID: {{ cust.id }}</span>
                      </div>
                    </div>
                  </td>

                  <!-- Contact -->
                  <td class="py-4 px-6">
                    <p class="font-semibold text-stone-800">{{ cust.email }}</p>
                    <p class="text-stone-500">{{ cust.phone || 'No phone recorded' }}</p>
                  </td>

                  <!-- Reservations Count -->
                  <td class="py-4 px-6 text-center">
                    <span class="px-2.5 py-1 rounded-lg bg-emerald-50 text-[#244B3B] font-bold">
                      {{ cust.totalReservations }}
                    </span>
                  </td>

                  <!-- Orders Count -->
                  <td class="py-4 px-6 text-center">
                    <span class="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 font-bold">
                      {{ cust.totalOrders }}
                    </span>
                  </td>

                  <!-- Total Spent -->
                  <td class="py-4 px-6 text-right font-mono font-bold text-sm text-[#244B3B]">
                    &dollar;{{ cust.totalSpent.toFixed(2) }}
                  </td>

                  <!-- Registered Date -->
                  <td class="py-4 px-6 text-stone-500">
                    {{ cust.createdAt | date:'mediumDate' }}
                  </td>

                  <!-- Activity Button -->
                  <td class="py-4 px-6 text-right">
                    <button
                      type="button"
                      (click)="viewCustomer(cust)"
                      class="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#244B3B] bg-emerald-50 hover:bg-emerald-100 transition-colors inline-flex items-center gap-1"
                    >
                      <mat-icon class="text-sm">visibility</mat-icon>
                      <span>Folio</span>
                    </button>
                  </td>

                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

    </div>

    <!-- Customer Activity Folio Modal -->
    @if (selectedCustomer(); as c) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div class="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-stone-200 max-h-[90vh] flex flex-col">
          
          <div class="p-6 bg-[#244B3B] text-white flex items-center justify-between">
            <div class="flex items-center gap-3">
              <img
                [src]="c.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'"
                alt="Avatar"
                class="w-12 h-12 rounded-full object-cover ring-2 ring-[#DFC48A]"
                referrerpolicy="no-referrer"
              />
              <div>
                <h3 class="font-serif-luxury text-xl font-bold">{{ c.name }}</h3>
                <p class="text-xs text-[#DFC48A]">{{ c.email }} &bull; {{ c.phone }}</p>
              </div>
            </div>
            <button
              type="button"
              (click)="selectedCustomer.set(null)"
              class="text-white/70 hover:text-white"
            >
              <mat-icon>close</mat-icon>
            </button>
          </div>

          <div class="p-6 overflow-y-auto space-y-6 text-xs text-stone-800">
            <!-- Metrics -->
            <div class="grid grid-cols-3 gap-3 text-center">
              <div class="p-3 bg-stone-50 rounded-2xl border border-stone-200">
                <span class="text-[10px] text-stone-500 uppercase font-bold">Total Reservations</span>
                <p class="text-xl font-bold text-stone-900 mt-1">{{ c.totalReservations }}</p>
              </div>
              <div class="p-3 bg-stone-50 rounded-2xl border border-stone-200">
                <span class="text-[10px] text-stone-500 uppercase font-bold">Orders Placed</span>
                <p class="text-xl font-bold text-stone-900 mt-1">{{ c.totalOrders }}</p>
              </div>
              <div class="p-3 bg-stone-50 rounded-2xl border border-stone-200">
                <span class="text-[10px] text-stone-500 uppercase font-bold">Lifetime Total</span>
                <p class="text-xl font-bold font-mono text-[#244B3B] mt-1">&dollar;{{ c.totalSpent.toFixed(2) }}</p>
              </div>
            </div>

            <!-- Booking History -->
            <div>
              <h4 class="font-bold text-stone-900 uppercase tracking-wider text-[11px] mb-2">Dining Reservations History</h4>
              <div class="space-y-2">
                @for (res of getCustomerReservations(c.id); track res.id) {
                  <div class="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                    <div>
                      <span class="font-mono font-bold text-[#244B3B]">{{ res.id }}</span>
                      <span class="ml-2 font-semibold text-stone-800">Table {{ res.tableNumber }} &bull; {{ res.guests }} Guests</span>
                      <p class="text-[11px] text-stone-500">{{ res.date }} at {{ res.timeSlot }}</p>
                    </div>
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                      {{ res.status }}
                    </span>
                  </div>
                }
                @if (getCustomerReservations(c.id).length === 0) {
                  <p class="text-stone-400 italic">No bookings on file.</p>
                }
              </div>
            </div>

            <!-- Food Orders History -->
            <div>
              <h4 class="font-bold text-stone-900 uppercase tracking-wider text-[11px] mb-2">Food Orders History</h4>
              <div class="space-y-2">
                @for (ord of getCustomerOrders(c.id); track ord.id) {
                  <div class="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                    <div>
                      <span class="font-mono font-bold text-stone-900">#{{ ord.id }}</span>
                      <span class="ml-2 text-stone-700">({{ ord.deliveryType }}) &bull; {{ ord.items.length }} courses</span>
                      <p class="text-[11px] text-stone-500">{{ ord.orderDate | date:'medium' }}</p>
                    </div>
                    <span class="font-mono font-bold text-[#244B3B]">&dollar;{{ ord.total.toFixed(2) }}</span>
                  </div>
                }
                @if (getCustomerOrders(c.id).length === 0) {
                  <p class="text-stone-400 italic">No food orders recorded.</p>
                }
              </div>
            </div>
          </div>

          <div class="p-4 bg-stone-100 border-t border-stone-200 text-right">
            <button
              type="button"
              (click)="selectedCustomer.set(null)"
              class="px-5 py-2 rounded-xl bg-stone-800 text-white font-semibold text-xs"
            >
              Close
            </button>
          </div>

        </div>
      </div>
    }
  `
})
export class CustomerManagement {
  readonly customerService = inject(CustomerService);
  readonly bookingService = inject(BookingService);
  readonly orderService = inject(OrderService);

  readonly searchQuery = signal<string>('');
  readonly selectedCustomer = signal<CustomerSummary | null>(null);

  readonly filteredCustomers = computed(() => {
    const list = this.customerService.customerSummaries();
    const query = this.searchQuery().trim().toLowerCase();
    if (!query) return list;

    return list.filter(c => 
      c.name.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query) ||
      (c.phone && c.phone.includes(query))
    );
  });

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  viewCustomer(c: CustomerSummary): void {
    this.selectedCustomer.set(c);
  }

  getCustomerReservations(customerId: string) {
    return this.bookingService.getByCustomerId(customerId);
  }

  getCustomerOrders(customerId: string) {
    return this.orderService.getByCustomerId(customerId);
  }
}
