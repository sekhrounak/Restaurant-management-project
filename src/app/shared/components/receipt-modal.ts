import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FoodOrder, Reservation } from '../../core/models/restaurant.models';

@Component({
  selector: 'app-receipt-modal',
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div class="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200 max-h-[90vh] flex flex-col">
        
        <!-- Modal Header (Non-print) -->
        <div class="no-print p-4 bg-[#244B3B] text-white flex items-center justify-between">
          <div class="flex items-center gap-2">
            <mat-icon class="text-[#DFC48A]">receipt</mat-icon>
            <h3 class="font-serif-luxury text-lg font-semibold tracking-wide">
              {{ order() ? 'Order Dining Folio' : 'Table Reservation Pass' }}
            </h3>
          </div>
          <button
            type="button"
            (click)="closeModal.emit()"
            class="text-white/70 hover:text-white p-1 rounded-lg"
          >
            <mat-icon>close</mat-icon>
          </button>
        </div>

        <!-- Printable Receipt Sheet -->
        <div class="p-6 overflow-y-auto flex-1 printable-area text-stone-800 bg-[#FAF9F5]">
          <!-- Restaurant Letterhead -->
          <div class="text-center pb-5 border-b border-stone-200">
            <div class="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#244B3B] text-[#DFC48A] mb-2 shadow">
              <mat-icon class="text-2xl">restaurant</mat-icon>
            </div>
            <h2 class="font-serif-luxury text-2xl font-bold tracking-widest text-[#244B3B]">AURA TABLE & BAR</h2>
            <p class="text-xs text-stone-500 uppercase tracking-widest font-medium mt-0.5">Haute Cuisine &bull; Reserve Collection</p>
            <p class="text-xs text-stone-500 mt-1">420 Grand Boulevard, Culinary Arts Quarter</p>
            <p class="text-xs text-stone-400">Tel: +1 (555) 800-AURA &bull; www.aurarestaurant.com</p>
          </div>

          <!-- Order Content -->
          @if (order(); as ord) {
            <div class="py-4 border-b border-stone-200 space-y-1.5 text-xs">
              <div class="flex justify-between">
                <span class="text-stone-500">Order ID:</span>
                <span class="font-mono font-bold text-stone-900">#{{ ord.id }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-stone-500">Guest Name:</span>
                <span class="font-semibold text-stone-900">{{ ord.customerName }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-stone-500">Service Type:</span>
                <span class="font-semibold text-[#244B3B]">{{ ord.deliveryType }} {{ ord.tableNumber ? '(Table ' + ord.tableNumber + ')' : '' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-stone-500">Date & Time:</span>
                <span class="text-stone-700">{{ ord.orderDate | date:'medium' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-stone-500">Payment Status:</span>
                <span class="font-semibold text-emerald-700">{{ ord.paymentStatus }} ({{ ord.paymentMethod }})</span>
              </div>
            </div>

            <!-- Items Breakdown -->
            <div class="py-4 border-b border-stone-200">
              <p class="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Itemized Order</p>
              <div class="space-y-2 text-xs">
                @for (item of ord.items; track item.foodId) {
                  <div class="flex justify-between items-start">
                    <div class="pr-2">
                      <span class="font-bold text-stone-900">{{ item.quantity }}x</span>
                      <span class="ml-1 text-stone-800">{{ item.name }}</span>
                    </div>
                    <span class="font-mono text-stone-900 whitespace-nowrap">
                      &dollar;{{ (item.price * item.quantity).toFixed(2) }}
                    </span>
                  </div>
                }
              </div>
            </div>

            <!-- Totals -->
            <div class="py-3 border-b border-dashed border-stone-300 space-y-1 text-xs">
              <div class="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span class="font-mono">&dollar;{{ ord.subtotal.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between text-stone-600">
                <span>State & Culinary Tax (8.5%)</span>
                <span class="font-mono">&dollar;{{ ord.tax.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between text-sm font-bold text-[#244B3B] pt-2 border-t border-stone-200">
                <span>Total Amount</span>
                <span class="font-mono text-base">&dollar;{{ ord.total.toFixed(2) }}</span>
              </div>
            </div>
          }

          <!-- Reservation Pass Content -->
          @if (reservation(); as res) {
            <div class="py-4 border-b border-stone-200 space-y-2 text-xs">
              <div class="flex justify-between items-center bg-[#244B3B]/5 p-3 rounded-xl border border-[#244B3B]/10">
                <div>
                  <p class="text-[10px] text-stone-500 uppercase tracking-wider">Booking Confirmation</p>
                  <p class="text-lg font-mono font-bold text-[#244B3B]">{{ res.id }}</p>
                </div>
                <div class="text-right">
                  <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    {{ res.status }}
                  </span>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3 pt-2">
                <div class="bg-white p-2.5 rounded-xl border border-stone-200">
                  <p class="text-[10px] text-stone-400 uppercase">Reserved Table</p>
                  <p class="text-sm font-bold text-stone-900">Table {{ res.tableNumber }}</p>
                </div>
                <div class="bg-white p-2.5 rounded-xl border border-stone-200">
                  <p class="text-[10px] text-stone-400 uppercase">Party Size</p>
                  <p class="text-sm font-bold text-stone-900">{{ res.guests }} Guests</p>
                </div>
                <div class="bg-white p-2.5 rounded-xl border border-stone-200">
                  <p class="text-[10px] text-stone-400 uppercase">Date</p>
                  <p class="text-sm font-bold text-stone-900">{{ res.date }}</p>
                </div>
                <div class="bg-white p-2.5 rounded-xl border border-stone-200">
                  <p class="text-[10px] text-stone-400 uppercase">Arrival Time</p>
                  <p class="text-sm font-bold text-stone-900">{{ res.timeSlot }}</p>
                </div>
              </div>

              <div class="pt-2">
                <p class="text-[10px] text-stone-400 uppercase">Primary Guest</p>
                <p class="text-xs font-semibold text-stone-800">{{ res.customerName }} &bull; {{ res.customerPhone }}</p>
                <p class="text-xs text-stone-500">{{ res.customerEmail }}</p>
              </div>

              @if (res.specialRequests) {
                <div class="p-2.5 bg-amber-50 rounded-xl border border-amber-200/60 mt-2">
                  <p class="text-[10px] font-bold text-amber-900 uppercase">Special Hospitality Requests</p>
                  <p class="text-xs text-amber-800 italic mt-0.5">"{{ res.specialRequests }}"</p>
                </div>
              }
            </div>
          }

          <!-- Barcode simulation & Footer -->
          <div class="pt-4 text-center">
            <div class="font-mono text-xs tracking-[6px] text-stone-400 uppercase select-none">
              ||| | ||||| || |||| ||| ||||||| |||
            </div>
            <p class="text-[11px] text-stone-400 mt-2">
              Thank you for dining with Aura Table & Bar. We hold reserved tables for 15 minutes past scheduled seating.
            </p>
          </div>
        </div>

        <!-- Modal Footer Actions (Non-print) -->
        <div class="no-print p-4 bg-stone-100 border-t border-stone-200 flex items-center justify-between gap-3">
          <button
            type="button"
            (click)="closeModal.emit()"
            class="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-200 transition-colors"
          >
            Close
          </button>
          
          <button
            type="button"
            (click)="printDoc()"
            class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#244B3B] text-white hover:bg-[#193529] shadow-md transition-all duration-200"
          >
            <mat-icon class="text-base">print</mat-icon>
            <span>Print Folio / Pass</span>
          </button>
        </div>
      </div>
    </div>
  `
})
export class ReceiptModal {
  order = input<FoodOrder | null>(null);
  reservation = input<Reservation | null>(null);
  closeModal = output<void>();

  printDoc(): void {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }
}
