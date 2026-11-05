import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CartService } from '../../../core/services/cart.service';
import { OrderService } from '../../../core/services/order.service';
import { AuthService } from '../../../core/services/auth.service';
import { TableService } from '../../../core/services/table.service';
import { FoodOrder } from '../../../core/models/restaurant.models';
import { ReceiptModal } from '../../../shared/components/receipt-modal';

@Component({
  selector: 'app-shopping-cart',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatIconModule, ReceiptModal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <!-- Cart Header -->
      <div class="flex items-center justify-between pb-6 border-b border-stone-200">
        <div>
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#244B3B]/10 text-[#244B3B] text-xs font-semibold mb-2">
            <mat-icon class="text-sm">shopping_bag</mat-icon>
            <span>Cart & Checkout</span>
          </div>
          <h1 class="font-serif-luxury text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
            Your Culinary Order
          </h1>
          <p class="text-stone-600 text-sm mt-1">
            Review selected dishes, specify dining preferences, and submit order to the kitchen.
          </p>
        </div>

        @if (cartService.totalItemCount() > 0) {
          <button
            type="button"
            (click)="cartService.clearCart()"
            class="text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1 px-3 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 transition-colors"
          >
            <mat-icon class="text-sm">delete_sweep</mat-icon>
            <span>Clear Cart</span>
          </button>
        }
      </div>

      <!-- Empty Cart State -->
      @if (cartService.items().length === 0) {
        <div class="bg-white rounded-3xl border border-stone-200/90 p-12 text-center max-w-lg mx-auto shadow-sm my-12">
          <div class="w-16 h-16 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-4">
            <mat-icon class="text-4xl">shopping_basket</mat-icon>
          </div>
          <h3 class="font-serif-luxury text-2xl font-bold text-stone-800">Your order is currently empty</h3>
          <p class="text-xs text-stone-500 mt-2 leading-relaxed">
            Discover our artisanal starters, flame-grilled steaks, handcrafted pastas, and cellar cocktails to build your banquet.
          </p>
          <div class="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              routerLink="/customer/menu"
              class="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#244B3B] text-[#FAF9F5] font-bold text-xs shadow-md hover:bg-[#193529] transition-all"
            >
              Explore Food Menu
            </a>
            <a
              routerLink="/customer/booking"
              class="w-full sm:w-auto px-6 py-3 rounded-xl border border-stone-300 text-stone-700 font-semibold text-xs hover:bg-stone-50 transition-all"
            >
              Book a Table First
            </a>
          </div>
        </div>
      } @else {
        <!-- Cart Items & Checkout Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <!-- Left: Itemized Cart Items (7 Cols) -->
          <div class="lg:col-span-7 xl:col-span-8 bg-white rounded-3xl border border-stone-200/80 shadow-sm p-6 sm:p-7 space-y-6">
            <h2 class="text-base font-bold text-stone-900 pb-3 border-b border-stone-100 flex items-center justify-between">
              <span>Selected Courses ({{ cartService.totalItemCount() }} items)</span>
              <a routerLink="/customer/menu" class="text-xs text-[#244B3B] hover:text-[#C5A059] font-semibold">
                + Add More Dishes
              </a>
            </h2>

            <div class="divide-y divide-stone-100">
              @for (item of cartService.items(); track item.foodItem.id) {
                <div class="py-4 sm:py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <!-- Dish Info -->
                  <div class="flex items-center gap-3.5">
                    <img
                      [src]="item.foodItem.image"
                      [alt]="item.foodItem.name"
                      class="w-16 h-16 rounded-2xl object-cover shrink-0 border border-stone-200"
                      referrerpolicy="no-referrer"
                    />
                    <div>
                      <span class="text-[10px] uppercase font-bold tracking-wider text-[#C5A059]">
                        {{ item.foodItem.category }}
                      </span>
                      <h3 class="font-serif-luxury text-base font-bold text-stone-900 leading-snug">
                        {{ item.foodItem.name }}
                      </h3>
                      <p class="text-xs text-stone-500 font-mono mt-0.5">
                        &dollar;{{ item.foodItem.price.toFixed(2) }} each
                      </p>
                    </div>
                  </div>

                  <!-- Quantity Controls & Line Total -->
                  <div class="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-stone-100">
                    <!-- Plus/Minus -->
                    <div class="flex items-center rounded-xl border border-stone-300 bg-[#FAF9F5] p-1">
                      <button
                        type="button"
                        (click)="cartService.updateQuantity(item.foodItem.id, item.quantity - 1)"
                        class="w-7 h-7 rounded-lg bg-white border border-stone-200 text-stone-700 flex items-center justify-center hover:bg-stone-100"
                      >
                        <mat-icon class="text-xs">remove</mat-icon>
                      </button>
                      <span class="w-9 text-center font-bold text-stone-900 text-xs">
                        {{ item.quantity }}
                      </span>
                      <button
                        type="button"
                        (click)="cartService.updateQuantity(item.foodItem.id, item.quantity + 1)"
                        class="w-7 h-7 rounded-lg bg-white border border-stone-200 text-stone-700 flex items-center justify-center hover:bg-stone-100"
                      >
                        <mat-icon class="text-xs">add</mat-icon>
                      </button>
                    </div>

                    <!-- Line Total -->
                    <div class="text-right min-w-[70px]">
                      <span class="font-mono text-sm font-bold text-stone-900 block">
                        &dollar;{{ (item.foodItem.price * item.quantity).toFixed(2) }}
                      </span>
                    </div>

                    <!-- Remove Item Button -->
                    <button
                      type="button"
                      (click)="cartService.removeItem(item.foodItem.id)"
                      class="text-stone-400 hover:text-rose-600 p-1 rounded-lg transition-colors"
                      title="Remove from cart"
                    >
                      <mat-icon class="text-lg">delete_outline</mat-icon>
                    </button>
                  </div>
                </div>
              }
            </div>

            <!-- Notes Section -->
            <div class="pt-4 border-t border-stone-100">
              <label for="chefInstructionNotes" class="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                Special Kitchen Instructions / Allergies
              </label>
              <textarea
                id="chefInstructionNotes"
                [value]="chefNotes()"
                (input)="onNotesInput($event)"
                rows="2"
                placeholder="e.g., Dressing on the side, steaks cooked medium, extra lemons..."
                class="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-[#FAF9F5] text-stone-900 text-xs focus:ring-2 focus:ring-[#244B3B] outline-none transition-all resize-none"
              ></textarea>
            </div>
          </div>

          <!-- Right: Order Summary & Checkout Form (5 Cols) -->
          <div class="lg:col-span-5 xl:col-span-4 sticky top-28 space-y-6">
            <div class="bg-white p-6 sm:p-7 rounded-3xl border border-stone-200/80 shadow-lg space-y-5">
              
              <h2 class="text-base font-bold text-stone-900 pb-3 border-b border-stone-100">
                Order Billing & Delivery
              </h2>

              <form [formGroup]="checkoutForm" (ngSubmit)="submitOrder()" class="space-y-4">
                
                <!-- Service Type (Dine-in, Takeaway, Delivery) -->
                <div>
                  <span class="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                    Dining Service
                  </span>
                  <div class="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      (click)="setDeliveryType('Dine-In')"
                      class="py-2.5 px-2 rounded-xl text-xs font-bold border transition-all text-center"
                      [class.bg-[#244B3B]]="deliveryType() === 'Dine-In'"
                      [class.text-[#DFC48A]]="deliveryType() === 'Dine-In'"
                      [class.border-[#244B3B]]="deliveryType() === 'Dine-In'"
                      [class.border-stone-200]="deliveryType() !== 'Dine-In'"
                      [class.text-stone-700]="deliveryType() !== 'Dine-In'"
                    >
                      Dine-In
                    </button>
                    <button
                      type="button"
                      (click)="setDeliveryType('Takeaway')"
                      class="py-2.5 px-2 rounded-xl text-xs font-bold border transition-all text-center"
                      [class.bg-[#244B3B]]="deliveryType() === 'Takeaway'"
                      [class.text-[#DFC48A]]="deliveryType() === 'Takeaway'"
                      [class.border-[#244B3B]]="deliveryType() === 'Takeaway'"
                      [class.border-stone-200]="deliveryType() !== 'Takeaway'"
                      [class.text-stone-700]="deliveryType() !== 'Takeaway'"
                    >
                      Takeaway
                    </button>
                    <button
                      type="button"
                      (click)="setDeliveryType('Delivery')"
                      class="py-2.5 px-2 rounded-xl text-xs font-bold border transition-all text-center"
                      [class.bg-[#244B3B]]="deliveryType() === 'Delivery'"
                      [class.text-[#DFC48A]]="deliveryType() === 'Delivery'"
                      [class.border-[#244B3B]]="deliveryType() === 'Delivery'"
                      [class.border-stone-200]="deliveryType() !== 'Delivery'"
                      [class.text-stone-700]="deliveryType() !== 'Delivery'"
                    >
                      Delivery
                    </button>
                  </div>
                </div>

                <!-- Table Selector (if Dine-In) -->
                @if (deliveryType() === 'Dine-In') {
                  <div>
                    <label for="cartTableSelect" class="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                      Your Table Number <span class="text-rose-500">*</span>
                    </label>
                    <select
                      id="cartTableSelect"
                      formControlName="tableNumber"
                      class="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-[#FAF9F5] text-stone-900 text-sm font-medium focus:ring-2 focus:ring-[#244B3B] outline-none transition-all cursor-pointer"
                    >
                      <option value="">Select Table Seated At</option>
                      @for (tbl of tableService.tables(); track tbl.id) {
                        <option [value]="tbl.number">Table {{ tbl.number }} ({{ tbl.location }})</option>
                      }
                    </select>
                  </div>
                }

                <!-- Customer Name & Phone -->
                <div class="grid grid-cols-1 gap-3">
                  <div>
                    <label for="orderCustName" class="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                      Customer Name <span class="text-rose-500">*</span>
                    </label>
                    <input
                      id="orderCustName"
                      type="text"
                      formControlName="customerName"
                      placeholder="e.g. Eleanor Vance"
                      class="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 text-sm focus:ring-2 focus:ring-[#244B3B] outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label for="orderCustPhone" class="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                      Mobile Number <span class="text-rose-500">*</span>
                    </label>
                    <input
                      id="orderCustPhone"
                      type="tel"
                      formControlName="customerPhone"
                      placeholder="+1 (555) 234-5678"
                      class="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 text-sm focus:ring-2 focus:ring-[#244B3B] outline-none transition-all"
                    />
                  </div>
                </div>

                <!-- Payment Method -->
                <div>
                  <span class="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                    Payment Method
                  </span>
                  <div class="space-y-2">
                    <label class="flex items-center gap-2 p-2.5 rounded-xl border border-stone-200 cursor-pointer hover:bg-stone-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="Credit Card"
                        formControlName="paymentMethod"
                        class="accent-[#244B3B]"
                      />
                      <mat-icon class="text-stone-500 text-base">credit_card</mat-icon>
                      <span class="text-xs font-semibold text-stone-800">Credit / Debit Card (Demo)</span>
                    </label>
                    <label class="flex items-center gap-2 p-2.5 rounded-xl border border-stone-200 cursor-pointer hover:bg-stone-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="Digital Wallet"
                        formControlName="paymentMethod"
                        class="accent-[#244B3B]"
                      />
                      <mat-icon class="text-stone-500 text-base">contactless</mat-icon>
                      <span class="text-xs font-semibold text-stone-800">Apple Pay / Google Pay</span>
                    </label>
                    <label class="flex items-center gap-2 p-2.5 rounded-xl border border-stone-200 cursor-pointer hover:bg-stone-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="Cash on Dine-in"
                        formControlName="paymentMethod"
                        class="accent-[#244B3B]"
                      />
                      <mat-icon class="text-stone-500 text-base">payments</mat-icon>
                      <span class="text-xs font-semibold text-stone-800">Pay Tableside</span>
                    </label>
                  </div>
                </div>

                <!-- Financial Breakdown -->
                <div class="pt-4 border-t border-stone-200 space-y-2 text-xs">
                  <div class="flex justify-between text-stone-600">
                    <span>Subtotal</span>
                    <span class="font-mono font-semibold">&dollar;{{ cartService.subtotal().toFixed(2) }}</span>
                  </div>
                  <div class="flex justify-between text-stone-600">
                    <span>Culinary Tax & Service (8.5%)</span>
                    <span class="font-mono font-semibold">&dollar;{{ cartService.tax().toFixed(2) }}</span>
                  </div>
                  <div class="flex justify-between text-base font-bold text-[#244B3B] pt-2 border-t border-stone-200">
                    <span>Final Total</span>
                    <span class="font-mono text-lg">&dollar;{{ cartService.total().toFixed(2) }}</span>
                  </div>
                </div>

                <!-- Submit Button -->
                <button
                  type="submit"
                  [disabled]="checkoutForm.invalid || (deliveryType() === 'Dine-In' && !checkoutForm.get('tableNumber')?.value)"
                  class="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#244B3B] to-[#193529] text-[#FAF9F5] font-bold text-sm shadow-xl hover:shadow-2xl hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none mt-2"
                >
                  <mat-icon class="text-lg text-[#DFC48A]">send</mat-icon>
                  <span>Place Kitchen Order (&dollar;{{ cartService.total().toFixed(2) }})</span>
                </button>
              </form>

            </div>
          </div>

        </div>
      }

    </div>

    <!-- Order Receipt Modal -->
    @if (placedOrder()) {
      <app-receipt-modal
        [order]="placedOrder()"
        (closeModal)="onReceiptClose()"
      />
    }
  `
})
export class ShoppingCart {
  readonly cartService = inject(CartService);
  readonly orderService = inject(OrderService);
  readonly authService = inject(AuthService);
  readonly tableService = inject(TableService);
  private router = inject(Router);

  readonly deliveryType = signal<'Dine-In' | 'Takeaway' | 'Delivery'>('Dine-In');
  readonly chefNotes = signal<string>('');
  readonly placedOrder = signal<FoodOrder | null>(null);

  readonly checkoutForm = new FormGroup({
    customerName: new FormControl(this.authService.currentUser()?.name || '', [Validators.required]),
    customerPhone: new FormControl(this.authService.currentUser()?.phone || '+1 (555) 234-5678', [Validators.required]),
    tableNumber: new FormControl('T-01'),
    paymentMethod: new FormControl<'Credit Card' | 'Cash on Dine-in' | 'Digital Wallet'>('Credit Card', [Validators.required])
  });

  setDeliveryType(type: 'Dine-In' | 'Takeaway' | 'Delivery'): void {
    this.deliveryType.set(type);
    if (type !== 'Dine-In') {
      this.checkoutForm.get('tableNumber')?.clearValidators();
    } else {
      this.checkoutForm.get('tableNumber')?.setValidators([Validators.required]);
    }
    this.checkoutForm.get('tableNumber')?.updateValueAndValidity();
  }

  onNotesInput(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    this.chefNotes.set(textarea.value);
  }

  submitOrder(): void {
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

    const form = this.checkoutForm.value;
    const user = this.authService.currentUser();

    const result = this.orderService.placeOrder({
      customerId: user?.id || 'guest_' + Date.now().toString(36),
      customerName: form.customerName || 'Valued Guest',
      customerEmail: user?.email || 'guest@aurarestaurant.com',
      customerPhone: form.customerPhone || undefined,
      deliveryType: this.deliveryType(),
      tableNumber: this.deliveryType() === 'Dine-In' ? form.tableNumber || undefined : undefined,
      notes: this.chefNotes() || undefined,
      paymentMethod: form.paymentMethod || 'Credit Card'
    });

    if (result.success && result.order) {
      this.placedOrder.set(result.order);
    }
  }

  onReceiptClose(): void {
    this.placedOrder.set(null);
    this.router.navigate(['/customer/orders']);
  }
}
