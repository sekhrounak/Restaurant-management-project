import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { BookingService } from '../../../core/services/booking.service';
import { AuthService } from '../../../core/services/auth.service';
import { Reservation } from '../../../core/models/restaurant.models';
import { ReceiptModal } from '../../../shared/components/receipt-modal';

@Component({
  selector: 'app-customer-reservations',
  imports: [CommonModule, RouterLink, MatIconModule, ReceiptModal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#244B3B]/10 text-[#244B3B] text-xs font-semibold mb-2">
            <mat-icon class="text-sm">event_seat</mat-icon>
            <span>Table Reservations</span>
          </div>
          <h1 class="font-serif-luxury text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
            My Table Reservations
          </h1>
          <p class="text-stone-600 text-sm mt-1">
            Manage your dining reservations, view table details, access confirmation passes, or cancel bookings.
          </p>
        </div>

        <a
          routerLink="/customer/booking"
          class="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#244B3B] text-[#FAF9F5] font-bold text-xs shadow-md hover:bg-[#193529] transition-all self-start sm:self-auto"
        >
          <mat-icon class="text-base text-[#DFC48A]">add</mat-icon>
          <span>New Reservation</span>
        </a>
      </div>

      <!-- Reservations Table / Cards -->
      @if (myReservations().length === 0) {
        <div class="bg-white rounded-3xl border border-stone-200 p-12 text-center max-w-md mx-auto shadow-sm my-8">
          <div class="w-16 h-16 rounded-2xl bg-emerald-50 text-[#244B3B] flex items-center justify-center mx-auto mb-4">
            <mat-icon class="text-4xl">event_busy</mat-icon>
          </div>
          <h3 class="font-serif-luxury text-2xl font-bold text-stone-800">No Reservations Found</h3>
          <p class="text-xs text-stone-500 mt-2 leading-relaxed">
            You haven't booked any tables under this account yet. Reserve an intimate dining experience with us today.
          </p>
          <a
            routerLink="/customer/booking"
            class="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#244B3B] text-white font-bold text-xs shadow-md"
          >
            <span>Book Your First Table</span>
            <mat-icon class="text-sm">arrow_forward</mat-icon>
          </a>
        </div>
      } @else {
        <div class="bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-[#FAF9F5] border-b border-stone-200 text-stone-500 uppercase text-[11px] font-bold tracking-wider">
                  <th class="py-4 px-6">Booking ID</th>
                  <th class="py-4 px-6">Table</th>
                  <th class="py-4 px-6">Date & Time</th>
                  <th class="py-4 px-6">Party Size</th>
                  <th class="py-4 px-6">Status</th>
                  <th class="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-stone-100 text-sm">
                @for (res of myReservations(); track res.id) {
                  <tr class="hover:bg-stone-50/70 transition-colors">
                    
                    <!-- ID -->
                    <td class="py-4 px-6">
                      <span class="font-mono font-bold text-[#244B3B] bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                        {{ res.id }}
                      </span>
                      <p class="text-[10px] text-stone-400 mt-1">Booked {{ res.createdAt | date:'shortDate' }}</p>
                    </td>

                    <!-- Table -->
                    <td class="py-4 px-6">
                      <div class="flex items-center gap-2">
                        <div class="w-8 h-8 rounded-lg bg-stone-100 text-[#244B3B] font-bold flex items-center justify-center text-xs">
                          {{ res.tableNumber }}
                        </div>
                        <div>
                          <p class="font-bold text-stone-900 text-xs">Table {{ res.tableNumber }}</p>
                          <p class="text-[11px] text-stone-500">Seating reserved</p>
                        </div>
                      </div>
                    </td>

                    <!-- Date & Time -->
                    <td class="py-4 px-6">
                      <p class="font-semibold text-stone-800 text-xs">{{ res.date }}</p>
                      <p class="text-[11px] text-[#244B3B] font-bold flex items-center gap-1 mt-0.5">
                        <mat-icon class="text-xs">schedule</mat-icon>
                        <span>{{ res.timeSlot }}</span>
                      </p>
                    </td>

                    <!-- Guests -->
                    <td class="py-4 px-6">
                      <span class="inline-flex items-center gap-1 text-xs font-semibold text-stone-700 bg-stone-100 px-2.5 py-1 rounded-lg">
                        <mat-icon class="text-xs">people</mat-icon>
                        <span>{{ res.guests }} Guests</span>
                      </span>
                    </td>

                    <!-- Status -->
                    <td class="py-4 px-6">
                      <span
                        class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1"
                        [ngClass]="{
                          'bg-emerald-100 text-emerald-800': res.status === 'Confirmed',
                          'bg-amber-100 text-amber-800': res.status === 'Pending',
                          'bg-stone-100 text-stone-700': res.status === 'Completed',
                          'bg-rose-100 text-rose-800': res.status === 'Cancelled' || res.status === 'Rejected'
                        }"
                      >
                        @if (res.status === 'Confirmed') {
                          <mat-icon class="text-xs">check_circle</mat-icon>
                        } @else if (res.status === 'Cancelled' || res.status === 'Rejected') {
                          <mat-icon class="text-xs">cancel</mat-icon>
                        } @else {
                          <mat-icon class="text-xs">hourglass_empty</mat-icon>
                        }
                        <span>{{ res.status }}</span>
                      </span>

                      @if (res.notes) {
                        <p class="text-[10px] text-stone-400 mt-1 max-w-[140px] truncate" [title]="res.notes">
                          {{ res.notes }}
                        </p>
                      }
                    </td>

                    <!-- Actions -->
                    <td class="py-4 px-6 text-right">
                      <div class="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          (click)="viewPass(res)"
                          class="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#244B3B] bg-emerald-50 hover:bg-emerald-100 transition-colors flex items-center gap-1"
                          title="View Digital Pass"
                        >
                          <mat-icon class="text-sm">receipt</mat-icon>
                          <span>Pass</span>
                        </button>

                        @if (res.status === 'Confirmed' || res.status === 'Pending') {
                          <button
                            type="button"
                            (click)="cancelBooking(res.id)"
                            class="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors flex items-center gap-1"
                            title="Cancel Reservation"
                          >
                            <mat-icon class="text-sm">close</mat-icon>
                            <span>Cancel</span>
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

    <!-- Pass Modal -->
    @if (selectedPass()) {
      <app-receipt-modal
        [reservation]="selectedPass()"
        (closeModal)="selectedPass.set(null)"
      />
    }
  `
})
export class CustomerReservations {
  readonly bookingService = inject(BookingService);
  readonly authService = inject(AuthService);

  readonly selectedPass = signal<Reservation | null>(null);

  readonly myReservations = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return [];
    return this.bookingService.getByCustomerId(user.id);
  });

  viewPass(res: Reservation): void {
    this.selectedPass.set(res);
  }

  cancelBooking(id: string): void {
    if (confirm('Are you sure you wish to cancel this reservation?')) {
      this.bookingService.cancelReservation(id);
    }
  }
}
