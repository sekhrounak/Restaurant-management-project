import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { BookingService } from '../../../core/services/booking.service';
import { Reservation, ReservationStatus } from '../../../core/models/restaurant.models';
import { ReceiptModal } from '../../../shared/components/receipt-modal';

@Component({
  selector: 'app-admin-reservations',
  imports: [CommonModule, MatIconModule, ReceiptModal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#244B3B]/10 text-[#244B3B] text-xs font-semibold mb-2">
            <mat-icon class="text-sm">event_note</mat-icon>
            <span>Hostess & Maitre D' Stand</span>
          </div>
          <h1 class="font-serif-luxury text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
            Reservation Management
          </h1>
          <p class="text-stone-600 text-sm mt-1">
            Review guest bookings, manage seating approvals, filter by dining service dates, and print passes.
          </p>
        </div>

        <!-- Quick Summary Counters -->
        <div class="flex items-center gap-3">
          <div class="bg-white px-4 py-2 rounded-2xl border border-stone-200 text-center shadow-sm">
            <p class="text-[10px] text-stone-400 uppercase font-bold">Total</p>
            <p class="text-lg font-bold text-stone-900">{{ bookingService.totalReservations() }}</p>
          </div>
          <div class="bg-white px-4 py-2 rounded-2xl border border-stone-200 text-center shadow-sm">
            <p class="text-[10px] text-emerald-600 uppercase font-bold">Confirmed</p>
            <p class="text-lg font-bold text-emerald-700">{{ bookingService.confirmedCount() }}</p>
          </div>
          <div class="bg-white px-4 py-2 rounded-2xl border border-stone-200 text-center shadow-sm">
            <p class="text-[10px] text-amber-600 uppercase font-bold">Pending</p>
            <p class="text-lg font-bold text-amber-700">{{ bookingService.pendingCount() }}</p>
          </div>
        </div>
      </div>

      <!-- Search & Filtering Toolbar -->
      <div class="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-sm space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-12 gap-3">
          
          <!-- Search Input (5 Cols) -->
          <div class="md:col-span-5 relative">
            <mat-icon class="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-lg">search</mat-icon>
            <input
              type="text"
              [value]="searchQuery()"
              (input)="onSearchInput($event)"
              placeholder="Search by guest name, email, or Booking ID..."
              class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 bg-[#FAF9F5] text-stone-900 text-xs focus:ring-2 focus:ring-[#244B3B] outline-none"
            />
          </div>

          <!-- Status Filter (4 Cols) -->
          <div class="md:col-span-4 flex items-center gap-1 overflow-x-auto">
            @for (st of statusOptions; track st) {
              <button
                type="button"
                (click)="selectedStatus.set(st)"
                class="px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors"
                [class.bg-[#244B3B]]="selectedStatus() === st"
                [class.text-[#DFC48A]]="selectedStatus() === st"
                [class.bg-stone-100]="selectedStatus() !== st"
                [class.text-stone-700]="selectedStatus() !== st"
              >
                {{ st }}
              </button>
            }
          </div>

          <!-- Date Filter (3 Cols) -->
          <div class="md:col-span-3">
            <select
              [value]="selectedDateFilter()"
              (change)="onDateFilterChange($event)"
              class="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-[#FAF9F5] text-stone-900 text-xs font-semibold focus:ring-2 focus:ring-[#244B3B] outline-none cursor-pointer"
            >
              <option value="all">All Dates</option>
              <option value="today">Today's Reservations</option>
              <option value="tomorrow">Tomorrow's Reservations</option>
            </select>
          </div>

        </div>
      </div>

      <!-- Reservations Data Table -->
      @if (filteredReservations().length === 0) {
        <div class="bg-white rounded-3xl border border-stone-200 p-12 text-center max-w-md mx-auto shadow-sm">
          <mat-icon class="text-5xl text-stone-300">event_busy</mat-icon>
          <h3 class="text-base font-bold text-stone-800 mt-3">No matching reservations</h3>
          <p class="text-xs text-stone-500 mt-1">Adjust search parameters or status filters to view records.</p>
        </div>
      } @else {
        <div class="bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-[#FAF9F5] border-b border-stone-200 text-stone-500 uppercase text-[11px] font-bold tracking-wider">
                  <th class="py-4 px-6">Booking ID</th>
                  <th class="py-4 px-6">Customer & Contact</th>
                  <th class="py-4 px-6">Table</th>
                  <th class="py-4 px-6">Date & Time</th>
                  <th class="py-4 px-6">Guests</th>
                  <th class="py-4 px-6">Status</th>
                  <th class="py-4 px-6 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-stone-100 text-xs">
                @for (res of filteredReservations(); track res.id) {
                  <tr class="hover:bg-stone-50/80 transition-colors">
                    
                    <!-- ID -->
                    <td class="py-4 px-6 font-mono font-bold text-[#244B3B]">
                      <span class="bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                        {{ res.id }}
                      </span>
                    </td>

                    <!-- Customer -->
                    <td class="py-4 px-6">
                      <p class="font-bold text-stone-900 text-sm">{{ res.customerName }}</p>
                      <p class="text-stone-500">{{ res.customerEmail }}</p>
                      <p class="text-stone-400 mt-0.5">{{ res.customerPhone }}</p>
                      @if (res.specialRequests) {
                        <p class="text-[11px] text-amber-800 italic mt-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/50 inline-block">
                          "{{ res.specialRequests }}"
                        </p>
                      }
                    </td>

                    <!-- Table -->
                    <td class="py-4 px-6">
                      <div class="flex items-center gap-2">
                        <div class="w-8 h-8 rounded-lg bg-[#244B3B] text-[#DFC48A] font-bold flex items-center justify-center text-xs">
                          {{ res.tableNumber }}
                        </div>
                        <span class="font-bold text-stone-800">Table {{ res.tableNumber }}</span>
                      </div>
                    </td>

                    <!-- Date & Time -->
                    <td class="py-4 px-6">
                      <p class="font-bold text-stone-900">{{ res.date }}</p>
                      <p class="text-[#244B3B] font-semibold flex items-center gap-1 mt-0.5">
                        <mat-icon class="text-xs">schedule</mat-icon>
                        <span>{{ res.timeSlot }}</span>
                      </p>
                    </td>

                    <!-- Guests -->
                    <td class="py-4 px-6">
                      <span class="px-2.5 py-1 rounded-lg bg-stone-100 text-stone-700 font-bold inline-flex items-center gap-1">
                        <mat-icon class="text-xs">people</mat-icon>
                        <span>{{ res.guests }}</span>
                      </span>
                    </td>

                    <!-- Status -->
                    <td class="py-4 px-6">
                      <span
                        class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1"
                        [ngClass]="{
                          'bg-emerald-100 text-emerald-800': res.status === 'Confirmed',
                          'bg-amber-100 text-amber-800': res.status === 'Pending',
                          'bg-stone-100 text-stone-700': res.status === 'Completed',
                          'bg-rose-100 text-rose-800': res.status === 'Cancelled' || res.status === 'Rejected'
                        }"
                      >
                        {{ res.status }}
                      </span>
                    </td>

                    <!-- Actions -->
                    <td class="py-4 px-6 text-right">
                      <div class="flex items-center justify-end gap-1.5">
                        <!-- View Pass -->
                        <button
                          type="button"
                          (click)="viewPass(res)"
                          class="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                          title="Print / View Guest Pass"
                        >
                          <mat-icon class="text-base">print</mat-icon>
                        </button>

                        @if (res.status === 'Pending') {
                          <button
                            type="button"
                            (click)="updateStatus(res.id, 'Confirmed')"
                            class="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            (click)="updateStatus(res.id, 'Rejected')"
                            class="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-colors"
                          >
                            Reject
                          </button>
                        } @else if (res.status === 'Confirmed') {
                          <button
                            type="button"
                            (click)="updateStatus(res.id, 'Completed')"
                            class="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-[#244B3B] hover:bg-[#193529] text-white transition-colors"
                          >
                            Seat & Complete
                          </button>
                          <button
                            type="button"
                            (click)="updateStatus(res.id, 'Cancelled')"
                            class="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-rose-100 hover:bg-rose-200 text-rose-700 transition-colors"
                          >
                            Cancel
                          </button>
                        }
                      </div>
                    </td>

                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

    </div>

    <!-- Pass / Folio Modal -->
    @if (selectedPass()) {
      <app-receipt-modal
        [reservation]="selectedPass()"
        (closeModal)="selectedPass.set(null)"
      />
    }
  `
})
export class AdminReservations {
  readonly bookingService = inject(BookingService);

  readonly searchQuery = signal<string>('');
  readonly selectedStatus = signal<string>('All');
  readonly selectedDateFilter = signal<string>('all');
  readonly selectedPass = signal<Reservation | null>(null);

  readonly statusOptions = ['All', 'Confirmed', 'Pending', 'Completed', 'Cancelled'];

  readonly filteredReservations = computed(() => {
    let list = this.bookingService.reservations();
    const query = this.searchQuery().trim().toLowerCase();
    const status = this.selectedStatus();
    const dateFilter = this.selectedDateFilter();

    const todayStr = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    if (status !== 'All') {
      list = list.filter(r => r.status === status);
    }

    if (dateFilter === 'today') {
      list = list.filter(r => r.date === todayStr);
    } else if (dateFilter === 'tomorrow') {
      list = list.filter(r => r.date === tomorrowStr);
    }

    if (query) {
      list = list.filter(r => 
        r.id.toLowerCase().includes(query) ||
        r.customerName.toLowerCase().includes(query) ||
        r.customerEmail.toLowerCase().includes(query) ||
        r.tableNumber.toLowerCase().includes(query)
      );
    }

    return list;
  });

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  onDateFilterChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedDateFilter.set(select.value);
  }

  updateStatus(id: string, status: ReservationStatus): void {
    this.bookingService.updateReservationStatus(id, status);
  }

  viewPass(res: Reservation): void {
    this.selectedPass.set(res);
  }
}
