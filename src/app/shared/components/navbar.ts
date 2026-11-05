import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { BookingService } from '../../core/services/booking.service';
import { OrderService } from '../../core/services/order.service';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="sticky top-0 z-40 bg-[#244B3B] text-[#F6F5F0] border-b border-[#2f5f4b] shadow-md">
      <!-- Main Bar -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        <!-- Brand Logo & Identity -->
        <div class="flex items-center gap-6">
          <a routerLink="/" class="flex items-center gap-3 group focus:outline-none">
            <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-[#DFC48A] to-[#C5A059] flex items-center justify-center text-[#244B3B] shadow-inner group-hover:scale-105 transition-transform duration-300">
              <mat-icon class="text-2xl">restaurant</mat-icon>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="font-serif-luxury text-2xl tracking-wide font-semibold text-[#FAF9F5] group-hover:text-[#DFC48A] transition-colors">
                  AURA
                </span>
                <span class="text-[10px] tracking-widest uppercase px-1.5 py-0.5 rounded bg-[#C5A059]/20 text-[#DFC48A] border border-[#C5A059]/30 font-semibold">
                  EST. 2018
                </span>
              </div>
              <p class="text-[11px] text-[#F6F5F0]/70 tracking-wider uppercase font-medium">TABLE & BAR &bull; HAUTE CUISINE</p>
            </div>
          </a>

          <!-- Mode Badge / Switcher -->
          <div class="hidden lg:flex items-center bg-[#193529] p-1 rounded-xl border border-white/10 shadow-inner">
            <button
              type="button"
              (click)="switchToCustomer()"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
              [class.bg-[#244B3B]]="authService.currentRole() === 'customer'"
              [class.text-[#DFC48A]]="authService.currentRole() === 'customer'"
              [class.shadow-sm]="authService.currentRole() === 'customer'"
              [class.text-stone-300]="authService.currentRole() !== 'customer'"
              [class.hover:text-white]="authService.currentRole() !== 'customer'"
            >
              <mat-icon class="text-sm">person</mat-icon>
              <span>Customer View</span>
            </button>
            <button
              type="button"
              (click)="switchToAdmin()"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
              [class.bg-[#C5A059]]="authService.currentRole() === 'admin'"
              [class.text-[#193529]]="authService.currentRole() === 'admin'"
              [class.font-semibold]="authService.currentRole() === 'admin'"
              [class.shadow-sm]="authService.currentRole() === 'admin'"
              [class.text-stone-300]="authService.currentRole() !== 'admin'"
              [class.hover:text-white]="authService.currentRole() !== 'admin'"
            >
              <mat-icon class="text-sm">admin_panel_settings</mat-icon>
              <span>Admin Portal</span>
            </button>
          </div>
        </div>

        <!-- Desktop Navigation Links -->
        <nav class="hidden md:flex items-center gap-1">
          @if (authService.currentRole() === 'customer') {
            <a
              routerLink="/customer/dashboard"
              routerLinkActive="bg-[#193529] text-[#DFC48A] border-b-2 border-[#DFC48A]"
              class="px-3.5 py-2 rounded-lg text-sm font-medium text-stone-200 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1.5"
            >
              <mat-icon class="text-base">dashboard</mat-icon>
              <span>Dashboard</span>
            </a>
            <a
              routerLink="/customer/booking"
              routerLinkActive="bg-[#193529] text-[#DFC48A] border-b-2 border-[#DFC48A]"
              class="px-3.5 py-2 rounded-lg text-sm font-medium text-stone-200 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1.5"
            >
              <mat-icon class="text-base">table_restaurant</mat-icon>
              <span>Book Table</span>
            </a>
            <a
              routerLink="/customer/menu"
              routerLinkActive="bg-[#193529] text-[#DFC48A] border-b-2 border-[#DFC48A]"
              class="px-3.5 py-2 rounded-lg text-sm font-medium text-stone-200 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1.5"
            >
              <mat-icon class="text-base">menu_book</mat-icon>
              <span>Menu & Order</span>
            </a>
            <a
              routerLink="/customer/reservations"
              routerLinkActive="bg-[#193529] text-[#DFC48A] border-b-2 border-[#DFC48A]"
              class="px-3.5 py-2 rounded-lg text-sm font-medium text-stone-200 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1.5"
            >
              <mat-icon class="text-base">event_seat</mat-icon>
              <span>Reservations</span>
              @if (customerReservationCount() > 0) {
                <span class="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-[#C5A059] text-[#193529] font-bold">
                  {{ customerReservationCount() }}
                </span>
              }
            </a>
            <a
              routerLink="/customer/orders"
              routerLinkActive="bg-[#193529] text-[#DFC48A] border-b-2 border-[#DFC48A]"
              class="px-3.5 py-2 rounded-lg text-sm font-medium text-stone-200 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1.5"
            >
              <mat-icon class="text-base">receipt_long</mat-icon>
              <span>My Orders</span>
              @if (customerOrderCount() > 0) {
                <span class="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-500 text-white font-bold">
                  {{ customerOrderCount() }}
                </span>
              }
            </a>
          } @else {
            <a
              routerLink="/admin/dashboard"
              routerLinkActive="bg-[#193529] text-[#DFC48A] border-b-2 border-[#DFC48A]"
              class="px-3 py-2 rounded-lg text-sm font-medium text-stone-200 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1.5"
            >
              <mat-icon class="text-base">analytics</mat-icon>
              <span>Overview</span>
            </a>
            <a
              routerLink="/admin/reservations"
              routerLinkActive="bg-[#193529] text-[#DFC48A] border-b-2 border-[#DFC48A]"
              class="px-3 py-2 rounded-lg text-sm font-medium text-stone-200 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1.5"
            >
              <mat-icon class="text-base">event_note</mat-icon>
              <span>Bookings</span>
              @if (bookingService.todayBookingsCount() > 0) {
                <span class="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-[#C5A059] text-[#193529] font-bold">
                  {{ bookingService.todayBookingsCount() }} today
                </span>
              }
            </a>
            <a
              routerLink="/admin/orders"
              routerLinkActive="bg-[#193529] text-[#DFC48A] border-b-2 border-[#DFC48A]"
              class="px-3 py-2 rounded-lg text-sm font-medium text-stone-200 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1.5"
            >
              <mat-icon class="text-base">soup_kitchen</mat-icon>
              <span>Orders & Kitchen</span>
              @if (orderService.activeKitchenOrders().length > 0) {
                <span class="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white font-bold animate-pulse">
                  {{ orderService.activeKitchenOrders().length }}
                </span>
              }
            </a>
            <a
              routerLink="/admin/menu-management"
              routerLinkActive="bg-[#193529] text-[#DFC48A] border-b-2 border-[#DFC48A]"
              class="px-3 py-2 rounded-lg text-sm font-medium text-stone-200 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1.5"
            >
              <mat-icon class="text-base">restaurant_menu</mat-icon>
              <span>Menu</span>
            </a>
            <a
              routerLink="/admin/table-management"
              routerLinkActive="bg-[#193529] text-[#DFC48A] border-b-2 border-[#DFC48A]"
              class="px-3 py-2 rounded-lg text-sm font-medium text-stone-200 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1.5"
            >
              <mat-icon class="text-base">grid_view</mat-icon>
              <span>Tables</span>
            </a>
            <a
              routerLink="/admin/customers"
              routerLinkActive="bg-[#193529] text-[#DFC48A] border-b-2 border-[#DFC48A]"
              class="px-3 py-2 rounded-lg text-sm font-medium text-stone-200 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1.5"
            >
              <mat-icon class="text-base">group</mat-icon>
              <span>Guests</span>
            </a>
          }
        </nav>

        <!-- Right Side: Cart, User Profile & Mobile Toggle -->
        <div class="flex items-center gap-3">
          
          <!-- Cart Button (Customer) -->
          @if (authService.currentRole() === 'customer') {
            <a
              routerLink="/customer/cart"
              class="relative flex items-center gap-2 bg-[#193529] hover:bg-[#142a21] text-[#F6F5F0] px-3.5 py-2 rounded-xl border border-white/10 transition-all duration-200 hover:border-[#DFC48A]/40"
              title="View Cart"
            >
              <mat-icon class="text-xl text-[#DFC48A]">shopping_bag</mat-icon>
              <span class="hidden sm:inline font-semibold text-sm">
                &dollar;{{ cartService.total().toFixed(2) }}
              </span>
              @if (cartService.totalItemCount() > 0) {
                <span class="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#C5A059] text-[#193529] font-bold text-xs flex items-center justify-center shadow-md animate-bounce">
                  {{ cartService.totalItemCount() }}
                </span>
              }
            </a>
          }

          <!-- User Profile Indicator & Dropdown -->
          <div class="relative">
            <button
              type="button"
              (click)="toggleUserMenu()"
              class="flex items-center gap-2.5 p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors focus:outline-none"
            >
              <img
                [src]="userAvatar()"
                alt="User avatar"
                class="w-8 h-8 rounded-lg object-cover ring-1 ring-[#DFC48A]/50"
                referrerpolicy="no-referrer"
              />
              <div class="hidden xl:block text-left pr-1">
                <p class="text-xs font-semibold text-stone-100 truncate max-w-[120px]">
                  {{ authService.currentUser()?.name ?? 'Guest User' }}
                </p>
                <p class="text-[10px] text-[#DFC48A] uppercase tracking-wider font-medium">
                  {{ authService.currentRole() }}
                </p>
              </div>
              <mat-icon class="text-sm text-stone-400">arrow_drop_down</mat-icon>
            </button>

            <!-- Dropdown Menu -->
            @if (showUserMenu()) {
              <div
                class="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-stone-200 text-stone-800 py-2 z-50 animate-in fade-in duration-200"
              >
                <div class="px-4 py-3 border-b border-stone-100 bg-[#FAF9F5] rounded-t-xl">
                  <p class="text-xs text-stone-500 font-medium">Signed in as</p>
                  <p class="text-sm font-bold text-stone-900 truncate">{{ authService.currentUser()?.name }}</p>
                  <p class="text-xs text-stone-500 truncate">{{ authService.currentUser()?.email }}</p>
                  <div class="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                    [class.bg-emerald-100]="authService.currentRole() === 'customer'"
                    [class.text-emerald-800]="authService.currentRole() === 'customer'"
                    [class.bg-amber-100]="authService.currentRole() === 'admin'"
                    [class.text-amber-800]="authService.currentRole() === 'admin'"
                  >
                    <mat-icon class="text-xs">verified</mat-icon>
                    <span>{{ authService.currentRole() }}</span>
                  </div>
                </div>

                <div class="p-2 space-y-1">
                  <button
                    type="button"
                    (click)="quickSwitch()"
                    class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-100 transition-colors"
                  >
                    <mat-icon class="text-base text-[#244B3B]">sync_alt</mat-icon>
                    <span>Switch to {{ authService.currentRole() === 'customer' ? 'Admin Portal' : 'Customer View' }}</span>
                  </button>

                  <a
                    routerLink="/auth/login"
                    (click)="showUserMenu.set(false)"
                    class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-100 transition-colors"
                  >
                    <mat-icon class="text-base text-stone-500">switch_account</mat-icon>
                    <span>Login with Different Account</span>
                  </a>

                  <button
                    type="button"
                    (click)="logout()"
                    class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <mat-icon class="text-base text-rose-500">logout</mat-icon>
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            }
          </div>

          <!-- Mobile Menu Hamburger Button -->
          <button
            type="button"
            (click)="toggleMobileMenu()"
            class="md:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 text-stone-200"
            aria-label="Toggle Navigation Menu"
          >
            <mat-icon>{{ showMobileMenu() ? 'close' : 'menu' }}</mat-icon>
          </button>
        </div>
      </div>

      <!-- Mobile Navigation Drawer -->
      @if (showMobileMenu()) {
        <div class="md:hidden bg-[#193529] border-t border-white/10 px-4 pt-3 pb-6 space-y-2">
          <!-- Role Switcher Mobile -->
          <div class="grid grid-cols-2 gap-2 p-1 bg-black/20 rounded-xl mb-3">
            <button
              type="button"
              (click)="switchToCustomer(); showMobileMenu.set(false)"
              class="py-2 text-xs font-semibold rounded-lg text-center"
              [class.bg-[#244B3B]]="authService.currentRole() === 'customer'"
              [class.text-[#DFC48A]]="authService.currentRole() === 'customer'"
              [class.text-stone-300]="authService.currentRole() !== 'customer'"
            >
              Customer View
            </button>
            <button
              type="button"
              (click)="switchToAdmin(); showMobileMenu.set(false)"
              class="py-2 text-xs font-semibold rounded-lg text-center"
              [class.bg-[#C5A059]]="authService.currentRole() === 'admin'"
              [class.text-[#193529]]="authService.currentRole() === 'admin'"
              [class.text-stone-300]="authService.currentRole() !== 'admin'"
            >
              Admin Portal
            </button>
          </div>

          @if (authService.currentRole() === 'customer') {
            <a
              routerLink="/customer/dashboard"
              (click)="showMobileMenu.set(false)"
              class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-stone-200 hover:bg-white/10"
            >
              <mat-icon>dashboard</mat-icon>
              <span>Customer Dashboard</span>
            </a>
            <a
              routerLink="/customer/booking"
              (click)="showMobileMenu.set(false)"
              class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-stone-200 hover:bg-white/10"
            >
              <mat-icon>table_restaurant</mat-icon>
              <span>Book Table</span>
            </a>
            <a
              routerLink="/customer/menu"
              (click)="showMobileMenu.set(false)"
              class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-stone-200 hover:bg-white/10"
            >
              <mat-icon>menu_book</mat-icon>
              <span>Food Menu</span>
            </a>
            <a
              routerLink="/customer/cart"
              (click)="showMobileMenu.set(false)"
              class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-stone-200 hover:bg-white/10"
            >
              <mat-icon>shopping_bag</mat-icon>
              <span>Shopping Cart ({{ cartService.totalItemCount() }})</span>
            </a>
            <a
              routerLink="/customer/reservations"
              (click)="showMobileMenu.set(false)"
              class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-stone-200 hover:bg-white/10"
            >
              <mat-icon>event_seat</mat-icon>
              <span>My Reservations</span>
            </a>
            <a
              routerLink="/customer/orders"
              (click)="showMobileMenu.set(false)"
              class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-stone-200 hover:bg-white/10"
            >
              <mat-icon>receipt_long</mat-icon>
              <span>My Orders</span>
            </a>
          } @else {
            <a
              routerLink="/admin/dashboard"
              (click)="showMobileMenu.set(false)"
              class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-stone-200 hover:bg-white/10"
            >
              <mat-icon>analytics</mat-icon>
              <span>Admin Overview</span>
            </a>
            <a
              routerLink="/admin/reservations"
              (click)="showMobileMenu.set(false)"
              class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-stone-200 hover:bg-white/10"
            >
              <mat-icon>event_note</mat-icon>
              <span>Reservation Management</span>
            </a>
            <a
              routerLink="/admin/orders"
              (click)="showMobileMenu.set(false)"
              class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-stone-200 hover:bg-white/10"
            >
              <mat-icon>soup_kitchen</mat-icon>
              <span>Kitchen & Orders</span>
            </a>
            <a
              routerLink="/admin/menu-management"
              (click)="showMobileMenu.set(false)"
              class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-stone-200 hover:bg-white/10"
            >
              <mat-icon>restaurant_menu</mat-icon>
              <span>Food Menu Management</span>
            </a>
            <a
              routerLink="/admin/table-management"
              (click)="showMobileMenu.set(false)"
              class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-stone-200 hover:bg-white/10"
            >
              <mat-icon>grid_view</mat-icon>
              <span>Table Management</span>
            </a>
            <a
              routerLink="/admin/customers"
              (click)="showMobileMenu.set(false)"
              class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-stone-200 hover:bg-white/10"
            >
              <mat-icon>group</mat-icon>
              <span>Guest Directory</span>
            </a>
          }
        </div>
      }
    </header>
  `
})
export class Navbar {
  readonly authService = inject(AuthService);
  readonly cartService = inject(CartService);
  readonly bookingService = inject(BookingService);
  readonly orderService = inject(OrderService);
  private router = inject(Router);

  readonly showUserMenu = signal(false);
  readonly showMobileMenu = signal(false);

  readonly userAvatar = computed(() => {
    return this.authService.currentUser()?.avatar || 
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';
  });

  readonly customerReservationCount = computed(() => {
    const custId = this.authService.currentUser()?.id;
    if (!custId) return 0;
    return this.bookingService.getByCustomerId(custId).filter(r => r.status === 'Confirmed' || r.status === 'Pending').length;
  });

  readonly customerOrderCount = computed(() => {
    const custId = this.authService.currentUser()?.id;
    if (!custId) return 0;
    return this.orderService.getByCustomerId(custId).filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length;
  });

  switchToCustomer(): void {
    this.authService.switchRole('customer');
    this.router.navigate(['/customer/dashboard']);
  }

  switchToAdmin(): void {
    this.authService.switchRole('admin');
    this.router.navigate(['/admin/dashboard']);
  }

  quickSwitch(): void {
    const nextRole = this.authService.currentRole() === 'customer' ? 'admin' : 'customer';
    if (nextRole === 'admin') {
      this.switchToAdmin();
    } else {
      this.switchToCustomer();
    }
    this.showUserMenu.set(false);
  }

  toggleUserMenu(): void {
    this.showUserMenu.update(v => !v);
  }

  toggleMobileMenu(): void {
    this.showMobileMenu.update(v => !v);
  }

  logout(): void {
    this.authService.logout();
    this.showUserMenu.set(false);
    this.router.navigate(['/auth/login']);
  }
}
