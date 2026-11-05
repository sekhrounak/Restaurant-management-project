import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { TableService } from '../../../core/services/table.service';
import { BookingService } from '../../../core/services/booking.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { RestaurantTable, Reservation } from '../../../core/models/restaurant.models';
import { ReceiptModal } from '../../../shared/components/receipt-modal';

@Component({
  selector: 'app-table-booking',
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, ReceiptModal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <!-- Page Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#244B3B]/10 text-[#244B3B] text-xs font-semibold mb-2">
            <mat-icon class="text-sm">restaurant</mat-icon>
            <span>Reservations Concierge</span>
          </div>
          <h1 class="font-serif-luxury text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
            Reserve Your Dining Experience
          </h1>
          <p class="text-stone-600 text-sm mt-1">
            Select your preferred dining date, seating time, party size, and table location on our interactive floor plan.
          </p>
        </div>

        <!-- Legend -->
        <div class="flex items-center gap-4 bg-white px-4 py-2.5 rounded-2xl border border-stone-200 text-xs text-stone-600 shadow-sm shrink-0">
          <div class="flex items-center gap-1.5">
            <div class="w-3.5 h-3.5 rounded-md bg-emerald-100 border border-emerald-400"></div>
            <span>Available</span>
          </div>
          <div class="flex items-center gap-1.5">
            <div class="w-3.5 h-3.5 rounded-md bg-rose-100 border border-rose-400"></div>
            <span>Booked / Taken</span>
          </div>
          <div class="flex items-center gap-1.5">
            <div class="w-3.5 h-3.5 rounded-md bg-[#244B3B] border border-[#244B3B]"></div>
            <span>Selected</span>
          </div>
        </div>
      </div>

      <!-- Main Booking Workflow Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        <!-- Left / Center: Date, Time & Interactive Floor Plan (8 Cols) -->
        <div class="lg:col-span-7 xl:col-span-8 space-y-6">
          
          <!-- Step 1: Scheduling Preferences (Date, Time, Guests) -->
          <div class="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-sm space-y-5">
            <div class="flex items-center gap-2 pb-3 border-b border-stone-100">
              <div class="w-7 h-7 rounded-lg bg-[#244B3B] text-[#DFC48A] flex items-center justify-center font-bold text-xs">
                1
              </div>
              <h2 class="text-base font-bold text-stone-900">Date, Time & Party Size</h2>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <!-- Date Selector -->
              <div>
                <label for="resDate" class="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">
                  Reservation Date
                </label>
                <div class="relative">
                  <input
                    id="resDate"
                    type="date"
                    [value]="selectedDate()"
                    (change)="onDateChange($event)"
                    [min]="minDate()"
                    class="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-[#FAF9F5] text-stone-900 text-sm font-medium focus:ring-2 focus:ring-[#244B3B] focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              <!-- Time Slot -->
              <div>
                <label for="resTime" class="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">
                  Seating Time
                </label>
                <select
                  id="resTime"
                  [value]="selectedTime()"
                  (change)="onTimeChange($event)"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-[#FAF9F5] text-stone-900 text-sm font-medium focus:ring-2 focus:ring-[#244B3B] focus:border-transparent outline-none transition-all cursor-pointer"
                >
                  @for (slot of timeSlots; track slot) {
                    <option [value]="slot">{{ slot }} (Dinner)</option>
                  }
                </select>
              </div>

              <!-- Guests Count -->
              <div>
                <span class="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">
                  Number of Guests
                </span>
                <div class="flex items-center rounded-xl border border-stone-300 bg-[#FAF9F5] p-1">
                  <button
                    type="button"
                    (click)="changeGuests(-1)"
                    [disabled]="selectedGuests() <= 1"
                    class="w-8 h-8 rounded-lg bg-white border border-stone-200 text-stone-700 flex items-center justify-center hover:bg-stone-100 disabled:opacity-40 transition-colors"
                  >
                    <mat-icon class="text-sm">remove</mat-icon>
                  </button>
                  <span class="flex-1 text-center font-bold text-stone-900 text-sm">
                    {{ selectedGuests() }} {{ selectedGuests() === 1 ? 'Guest' : 'Guests' }}
                  </span>
                  <button
                    type="button"
                    (click)="changeGuests(1)"
                    [disabled]="selectedGuests() >= 12"
                    class="w-8 h-8 rounded-lg bg-white border border-stone-200 text-stone-700 flex items-center justify-center hover:bg-stone-100 disabled:opacity-40 transition-colors"
                  >
                    <mat-icon class="text-sm">add</mat-icon>
                  </button>
                </div>
              </div>
            </div>

            <!-- Quick Time Pills -->
            <div>
              <p class="text-xs text-stone-500 mb-2 font-medium">Popular Evening Service Seatings:</p>
              <div class="flex flex-wrap gap-2">
                @for (slot of timeSlots; track slot) {
                  <button
                    type="button"
                    (click)="selectedTime.set(slot)"
                    class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150"
                    [class.bg-[#244B3B]]="selectedTime() === slot"
                    [class.text-[#DFC48A]]="selectedTime() === slot"
                    [class.bg-stone-100]="selectedTime() !== slot"
                    [class.text-stone-700]="selectedTime() !== slot"
                    [class.hover:bg-stone-200]="selectedTime() !== slot"
                  >
                    {{ slot }}
                  </button>
                }
              </div>
            </div>
          </div>

          <!-- Step 2: Interactive Table Selection Floor Map -->
          <div class="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-sm space-y-5">
            <div class="flex items-center justify-between pb-3 border-b border-stone-100">
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-lg bg-[#244B3B] text-[#DFC48A] flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <div>
                  <h2 class="text-base font-bold text-stone-900">Select Preferred Table</h2>
                  <p class="text-xs text-stone-500">Live floor plan for {{ selectedDate() }} at {{ selectedTime() }}</p>
                </div>
              </div>

              <!-- Zone Filter -->
              <div class="flex items-center gap-1 overflow-x-auto py-1">
                <button
                  type="button"
                  (click)="filterZone.set('all')"
                  class="px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors"
                  [class.bg-[#244B3B]]="filterZone() === 'all'"
                  [class.text-white]="filterZone() === 'all'"
                  [class.bg-stone-100]="filterZone() !== 'all'"
                  [class.text-stone-600]="filterZone() !== 'all'"
                >
                  All Zones
                </button>
                @for (loc of tableService.getLocations(); track loc) {
                  <button
                    type="button"
                    (click)="filterZone.set(loc)"
                    class="px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors whitespace-nowrap"
                    [class.bg-[#244B3B]]="filterZone() === loc"
                    [class.text-white]="filterZone() === loc"
                    [class.bg-stone-100]="filterZone() !== loc"
                    [class.text-stone-600]="filterZone() !== loc"
                  >
                    {{ loc }}
                  </button>
                }
              </div>
            </div>

            <!-- Floor Map Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              @for (tbl of filteredTables(); track tbl.id) {
                @let isBooked = isTableBookedOnSelectedTime(tbl.id);
                @let isSelected = selectedTable()?.id === tbl.id;
                @let isTooSmall = tbl.capacity < selectedGuests();

                <div
                  role="button"
                  tabindex="0"
                  (click)="selectTable(tbl, isBooked)"
                  (keydown.enter)="selectTable(tbl, isBooked)"
                  class="relative p-4 rounded-2xl border-2 transition-all duration-200 text-left select-none flex flex-col justify-between"
                  [class.cursor-pointer]="!isBooked"
                  [class.cursor-not-allowed]="isBooked"
                  [class.opacity-60]="isBooked"
                  [class.border-[#244B3B]]="isSelected"
                  [class.bg-[#244B3B]/5]="isSelected"
                  [class.ring-2]="isSelected"
                  [class.ring-[#C5A059]]="isSelected"
                  [class.border-rose-200]="isBooked"
                  [class.bg-rose-50/40]="isBooked"
                  [class.border-stone-200]="!isSelected && !isBooked"
                  [class.bg-white]="!isSelected && !isBooked"
                  [class.hover:border-[#244B3B]/50]="!isSelected && !isBooked"
                  [class.hover:shadow-md]="!isSelected && !isBooked"
                >
                  <!-- Table Header -->
                  <div class="flex items-start justify-between">
                    <div>
                      <div class="flex items-center gap-1.5">
                        <span class="font-bold text-base text-stone-900">{{ tbl.number }}</span>
                        @if (tbl.shape === 'round') {
                          <span class="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-600">Round</span>
                        } @else if (tbl.shape === 'booth') {
                          <span class="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">VIP Booth</span>
                        } @else {
                          <span class="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-600">Banquet</span>
                        }
                      </div>
                      <p class="text-xs text-stone-500 font-medium mt-0.5">{{ tbl.location }}</p>
                    </div>

                    <!-- Status Pill -->
                    @if (isBooked) {
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 flex items-center gap-1">
                        <mat-icon class="text-xs">block</mat-icon>
                        <span>Reserved</span>
                      </span>
                    } @else if (isSelected) {
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#244B3B] text-[#DFC48A] flex items-center gap-1">
                        <mat-icon class="text-xs">check</mat-icon>
                        <span>Selected</span>
                      </span>
                    } @else {
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                        Available
                      </span>
                    }
                  </div>

                  <!-- Seating Capacity & Details -->
                  <div class="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                    <div class="flex items-center gap-1" [class.text-amber-700]="isTooSmall">
                      <mat-icon class="text-sm">people</mat-icon>
                      <span class="font-semibold">{{ tbl.capacity }} Seats</span>
                      @if (isTooSmall) {
                        <span class="text-[10px] font-bold text-rose-600 ml-1">(Tight fit)</span>
                      }
                    </div>

                    @if (tbl.minSpend) {
                      <span class="text-[10px] font-bold text-[#C5A059]">
                        Min &dollar;{{ tbl.minSpend }}
                      </span>
                    }
                  </div>

                  <!-- Table Description -->
                  <p class="text-[11px] text-stone-500 mt-2 line-clamp-2">
                    {{ tbl.description }}
                  </p>
                </div>
              }
            </div>

            @if (selectedTable(); as table) {
              <div class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-[#244B3B] text-[#DFC48A] flex items-center justify-center font-bold">
                    {{ table.number }}
                  </div>
                  <div>
                    <p class="text-xs text-stone-600 font-medium">Currently Selected Table:</p>
                    <p class="text-sm font-bold text-stone-900">
                      Table {{ table.number }} &bull; {{ table.location }} (Up to {{ table.capacity }} guests)
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  (click)="selectedTable.set(null)"
                  class="text-xs font-semibold text-rose-600 hover:text-rose-800"
                >
                  Change
                </button>
              </div>
            }
          </div>

        </div>

        <!-- Right: Guest Details & Confirmation Form (5 Cols) -->
        <div class="lg:col-span-5 xl:col-span-4 sticky top-28">
          <div class="bg-white p-6 sm:p-7 rounded-3xl border border-stone-200/80 shadow-lg space-y-6">
            
            <div class="flex items-center gap-2 pb-3 border-b border-stone-100">
              <div class="w-7 h-7 rounded-lg bg-[#244B3B] text-[#DFC48A] flex items-center justify-center font-bold text-xs">
                3
              </div>
              <div>
                <h2 class="text-base font-bold text-stone-900">Guest Hospitality Information</h2>
                <p class="text-xs text-stone-500">Provide contact information for confirmation</p>
              </div>
            </div>

            <!-- Booking Summary Box -->
            <div class="bg-[#FAF9F5] p-4 rounded-2xl border border-stone-200 space-y-2 text-xs">
              <div class="flex justify-between">
                <span class="text-stone-500">Date:</span>
                <span class="font-bold text-stone-900">{{ selectedDate() }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-stone-500">Arrival Time:</span>
                <span class="font-bold text-stone-900">{{ selectedTime() }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-stone-500">Party Size:</span>
                <span class="font-bold text-stone-900">{{ selectedGuests() }} Guests</span>
              </div>
              <div class="flex justify-between pt-1 border-t border-stone-200">
                <span class="text-stone-500">Selected Table:</span>
                <span class="font-bold" [class.text-[#244B3B]]="selectedTable()" [class.text-rose-600]="!selectedTable()">
                  {{ selectedTable() ? 'Table ' + selectedTable()?.number + ' (' + selectedTable()?.location + ')' : 'None chosen yet' }}
                </span>
              </div>
            </div>

            <!-- Reactive Form -->
            <form [formGroup]="bookingForm" (ngSubmit)="submitReservation()" class="space-y-4">
              
              <!-- Customer Name -->
              <div>
                <label for="custName" class="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Full Name <span class="text-rose-500">*</span>
                </label>
                <div class="relative">
                  <input
                    id="custName"
                    type="text"
                    formControlName="name"
                    placeholder="e.g. Eleanor Vance"
                    class="w-full px-3.5 py-2.5 rounded-xl border bg-white text-stone-900 text-sm focus:ring-2 focus:ring-[#244B3B] outline-none transition-all"
                    [class.border-rose-400]="bookingForm.get('name')?.invalid && bookingForm.get('name')?.touched"
                    [class.border-stone-300]="!(bookingForm.get('name')?.invalid && bookingForm.get('name')?.touched)"
                  />
                </div>
                @if (bookingForm.get('name')?.invalid && bookingForm.get('name')?.touched) {
                  <p class="text-xs text-rose-600 mt-1">Please enter the guest's full name.</p>
                }
              </div>

              <!-- Customer Email -->
              <div>
                <label for="custEmail" class="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Email Address <span class="text-rose-500">*</span>
                </label>
                <input
                  id="custEmail"
                  type="email"
                  formControlName="email"
                  placeholder="e.g. guest@example.com"
                  class="w-full px-3.5 py-2.5 rounded-xl border bg-white text-stone-900 text-sm focus:ring-2 focus:ring-[#244B3B] outline-none transition-all"
                  [class.border-rose-400]="bookingForm.get('email')?.invalid && bookingForm.get('email')?.touched"
                  [class.border-stone-300]="!(bookingForm.get('email')?.invalid && bookingForm.get('email')?.touched)"
                />
                @if (bookingForm.get('email')?.invalid && bookingForm.get('email')?.touched) {
                  <p class="text-xs text-rose-600 mt-1">Please provide a valid email for confirmation pass.</p>
                }
              </div>

              <!-- Customer Phone -->
              <div>
                <label for="custPhone" class="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Mobile Phone Number <span class="text-rose-500">*</span>
                </label>
                <input
                  id="custPhone"
                  type="tel"
                  formControlName="phone"
                  placeholder="+1 (555) 234-5678"
                  class="w-full px-3.5 py-2.5 rounded-xl border bg-white text-stone-900 text-sm focus:ring-2 focus:ring-[#244B3B] outline-none transition-all"
                  [class.border-rose-400]="bookingForm.get('phone')?.invalid && bookingForm.get('phone')?.touched"
                  [class.border-stone-300]="!(bookingForm.get('phone')?.invalid && bookingForm.get('phone')?.touched)"
                />
                @if (bookingForm.get('phone')?.invalid && bookingForm.get('phone')?.touched) {
                  <p class="text-xs text-rose-600 mt-1">Phone number is required for SMS arrival alert.</p>
                }
              </div>

              <!-- Special Requests -->
              <div>
                <label for="specialNotes" class="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Special Requests / Dietary Notes
                </label>
                <textarea
                  id="specialNotes"
                  formControlName="specialRequests"
                  rows="2"
                  placeholder="Allergies, anniversary champagne, high chair, dietary requirements..."
                  class="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 text-sm focus:ring-2 focus:ring-[#244B3B] outline-none transition-all resize-none"
                ></textarea>
              </div>

              <!-- Submit Button -->
              <div class="pt-2">
                <button
                  type="submit"
                  [disabled]="bookingForm.invalid || !selectedTable()"
                  class="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#244B3B] to-[#193529] text-[#FAF9F5] font-bold text-sm shadow-xl hover:shadow-2xl hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
                >
                  <mat-icon class="text-lg text-[#DFC48A]">check_circle</mat-icon>
                  <span>Confirm Table Reservation</span>
                </button>
              </div>

              @if (!selectedTable()) {
                <p class="text-xs text-center text-amber-700 font-medium">
                  Please tap an available table on the floor plan above to continue.
                </p>
              }

              <p class="text-[11px] text-stone-400 text-center leading-normal">
                Complimentary 15-minute grace period on all reserved tables. Zero booking fees.
              </p>
            </form>

          </div>
        </div>

      </div>

    </div>

    <!-- Booking Pass Modal Upon Confirmation -->
    @if (confirmedReservation()) {
      <app-receipt-modal
        [reservation]="confirmedReservation()"
        (closeModal)="confirmedReservation.set(null)"
      />
    }
  `
})
export class TableBooking {
  readonly tableService = inject(TableService);
  readonly bookingService = inject(BookingService);
  readonly authService = inject(AuthService);
  readonly toast = inject(ToastService);

  readonly timeSlots: string[] = [
    '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'
  ];

  // Default date = tomorrow or today
  private getDefaultDate(): string {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }

  readonly selectedDate = signal<string>(this.getDefaultDate());
  readonly selectedTime = signal<string>('19:30');
  readonly selectedGuests = signal<number>(2);
  readonly selectedTable = signal<RestaurantTable | null>(null);
  readonly filterZone = signal<string>('all');

  readonly confirmedReservation = signal<Reservation | null>(null);

  readonly minDate = computed(() => {
    return new Date().toISOString().split('T')[0];
  });

  readonly bookingForm = new FormGroup({
    name: new FormControl(this.authService.currentUser()?.name || '', [Validators.required, Validators.minLength(2)]),
    email: new FormControl(this.authService.currentUser()?.email || '', [Validators.required, Validators.email]),
    phone: new FormControl(this.authService.currentUser()?.phone || '+1 (555) 234-5678', [Validators.required]),
    specialRequests: new FormControl('')
  });

  readonly filteredTables = computed(() => {
    const all = this.tableService.tables();
    const zone = this.filterZone();
    if (zone === 'all') return all;
    return all.filter(t => t.location === zone);
  });

  onDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.value) {
      this.selectedDate.set(input.value);
      this.checkSelectedTableConflict();
    }
  }

  onTimeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    if (select.value) {
      this.selectedTime.set(select.value);
      this.checkSelectedTableConflict();
    }
  }

  changeGuests(delta: number): void {
    const newVal = Math.max(1, Math.min(12, this.selectedGuests() + delta));
    this.selectedGuests.set(newVal);
  }

  isTableBookedOnSelectedTime(tableId: string): boolean {
    return this.bookingService.isTableBooked(tableId, this.selectedDate(), this.selectedTime());
  }

  selectTable(table: RestaurantTable, isBooked: boolean): void {
    if (isBooked) {
      this.toast.showWarning(
        'Table Unavailable',
        `Table ${table.number} is already booked for ${this.selectedDate()} at ${this.selectedTime()}.`
      );
      return;
    }
    this.selectedTable.set(table);
  }

  private checkSelectedTableConflict(): void {
    const table = this.selectedTable();
    if (table && this.isTableBookedOnSelectedTime(table.id)) {
      this.selectedTable.set(null);
      this.toast.showWarning('Table Reset', `Table ${table.number} is unavailable for this revised time slot.`);
    }
  }

  submitReservation(): void {
    if (this.bookingForm.invalid || !this.selectedTable()) {
      this.bookingForm.markAllAsTouched();
      return;
    }

    const table = this.selectedTable()!;
    const formVal = this.bookingForm.value;
    const currentUser = this.authService.currentUser();

    const result = this.bookingService.createReservation({
      customerId: currentUser?.id || 'guest_' + Date.now().toString(36),
      customerName: formVal.name || 'Valued Guest',
      customerEmail: formVal.email || '',
      customerPhone: formVal.phone || '',
      tableId: table.id,
      tableNumber: table.number,
      date: this.selectedDate(),
      timeSlot: this.selectedTime(),
      guests: this.selectedGuests(),
      specialRequests: formVal.specialRequests || undefined
    });

    if (result.success && result.reservation) {
      this.confirmedReservation.set(result.reservation);
      this.selectedTable.set(null);
    }
  }
}
