import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../core/models/restaurant.models';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div class="max-w-md w-full space-y-6">
        
        <!-- Brand Header -->
        <div class="text-center">
          <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#DFC48A] to-[#C5A059] text-[#244B3B] mb-3 shadow-lg shadow-[#244B3B]/10">
            <mat-icon class="text-3xl">restaurant</mat-icon>
          </div>
          <h1 class="font-serif-luxury text-3xl font-bold tracking-tight text-stone-900">
            AURA TABLE & BAR
          </h1>
          <p class="text-xs text-stone-500 uppercase tracking-widest font-semibold mt-1">
            Reservations & Culinary Access Portal
          </p>
        </div>

        <!-- Main Card -->
        <div class="bg-white rounded-3xl border border-stone-200/90 shadow-xl p-8 space-y-6">
          
          <!-- Role Switcher Segmented Control -->
          <div class="grid grid-cols-2 p-1 bg-[#FAF9F5] rounded-2xl border border-stone-200">
            <button
              type="button"
              (click)="selectedRole.set('customer')"
              class="py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
              [class.bg-[#244B3B]]="selectedRole() === 'customer'"
              [class.text-[#DFC48A]]="selectedRole() === 'customer'"
              [class.shadow-sm]="selectedRole() === 'customer'"
              [class.text-stone-600]="selectedRole() !== 'customer'"
            >
              <mat-icon class="text-base">person</mat-icon>
              <span>Customer Guest</span>
            </button>
            <button
              type="button"
              (click)="selectedRole.set('admin')"
              class="py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
              [class.bg-[#C5A059]]="selectedRole() === 'admin'"
              [class.text-[#193529]]="selectedRole() === 'admin'"
              [class.shadow-sm]="selectedRole() === 'admin'"
              [class.text-stone-600]="selectedRole() !== 'admin'"
            >
              <mat-icon class="text-base">admin_panel_settings</mat-icon>
              <span>Executive Admin</span>
            </button>
          </div>

          <!-- Auth Mode Toggle (Sign In / Register) -->
          <div class="flex items-center justify-between pb-3 border-b border-stone-100">
            <h2 class="text-base font-bold text-stone-900">
              {{ isRegisterMode() ? 'Create Dining Account' : 'Sign In to ' + (selectedRole() === 'admin' ? 'Admin Portal' : 'Your Account') }}
            </h2>
            <button
              type="button"
              (click)="toggleRegisterMode()"
              class="text-xs font-semibold text-[#244B3B] hover:text-[#C5A059] transition-colors"
            >
              {{ isRegisterMode() ? 'Already registered?' : 'Create Account' }}
            </button>
          </div>

          <!-- Form -->
          <form [formGroup]="authForm" (ngSubmit)="submitAuth()" class="space-y-4">
            
            @if (isRegisterMode()) {
              <!-- Full Name -->
              <div>
                <label for="regName" class="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  id="regName"
                  type="text"
                  formControlName="name"
                  placeholder="e.g. Julian Hayes"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-[#FAF9F5] text-stone-900 text-xs focus:ring-2 focus:ring-[#244B3B] outline-none"
                />
              </div>

              <!-- Phone -->
              <div>
                <label for="regPhone" class="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <input
                  id="regPhone"
                  type="tel"
                  formControlName="phone"
                  placeholder="+1 (555) 000-0000"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-[#FAF9F5] text-stone-900 text-xs focus:ring-2 focus:ring-[#244B3B] outline-none"
                />
              </div>
            }

            <!-- Email -->
            <div>
              <label for="authEmail" class="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                id="authEmail"
                type="email"
                formControlName="email"
                placeholder="name@example.com"
                class="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-[#FAF9F5] text-stone-900 text-xs focus:ring-2 focus:ring-[#244B3B] outline-none"
              />
            </div>

            <!-- Password -->
            <div>
              <label for="authPassword" class="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                id="authPassword"
                type="password"
                formControlName="password"
                placeholder="••••••••••••"
                class="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-[#FAF9F5] text-stone-900 text-xs focus:ring-2 focus:ring-[#244B3B] outline-none"
              />
            </div>

            <button
              type="submit"
              class="w-full py-3.5 px-4 rounded-xl font-bold text-xs shadow-lg transition-all"
              [class.bg-[#244B3B]]="selectedRole() === 'customer'"
              [class.text-[#FAF9F5]]="selectedRole() === 'customer'"
              [class.hover:bg-[#193529]]="selectedRole() === 'customer'"
              [class.bg-[#C5A059]]="selectedRole() === 'admin'"
              [class.text-[#193529]]="selectedRole() === 'admin'"
              [class.hover:bg-[#DFC48A]]="selectedRole() === 'admin'"
            >
              {{ isRegisterMode() ? 'Complete Registration' : 'Authenticate & Enter' }}
            </button>
          </form>

          <!-- Fast 1-Click Demo Logins -->
          <div class="pt-4 border-t border-stone-200/80 space-y-2">
            <p class="text-[11px] font-bold text-stone-400 uppercase tracking-wider text-center">
              Quick 1-Click Demo Profiles
            </p>
            <div class="grid grid-cols-1 gap-2">
              <button
                type="button"
                (click)="fillDemo('eleanor.vance@example.com', 'customer')"
                class="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-left flex items-center justify-between text-xs transition-colors"
              >
                <div class="flex items-center gap-2">
                  <div class="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px]">
                    EV
                  </div>
                  <span class="font-bold text-stone-800">Eleanor Vance</span>
                </div>
                <span class="text-[10px] uppercase font-bold text-emerald-800">Customer Demo</span>
              </button>

              <button
                type="button"
                (click)="fillDemo('admin@aurarestaurant.com', 'admin')"
                class="w-full p-2.5 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-100/50 text-left flex items-center justify-between text-xs transition-colors"
              >
                <div class="flex items-center gap-2">
                  <div class="w-6 h-6 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center font-bold text-[10px]">
                    CA
                  </div>
                  <span class="font-bold text-stone-800">Chef Antoine Rousseau</span>
                </div>
                <span class="text-[10px] uppercase font-bold text-amber-800">Admin Demo</span>
              </button>
            </div>
          </div>

        </div>

        <!-- Security Notice -->
        <p class="text-[11px] text-stone-400 text-center leading-relaxed max-w-sm mx-auto">
          Frontend simulated authentication for demonstration purposes. State is persisted safely in browser LocalStorage.
        </p>

      </div>
    </div>
  `
})
export class Login {
  readonly authService = inject(AuthService);
  private router = inject(Router);

  readonly selectedRole = signal<UserRole>('customer');
  readonly isRegisterMode = signal<boolean>(false);

  readonly authForm = new FormGroup({
    name: new FormControl(''),
    phone: new FormControl(''),
    email: new FormControl('eleanor.vance@example.com', [Validators.required, Validators.email]),
    password: new FormControl('••••••••', [Validators.required])
  });

  toggleRegisterMode(): void {
    this.isRegisterMode.update(v => !v);
  }

  fillDemo(email: string, role: UserRole): void {
    this.selectedRole.set(role);
    this.authForm.get('email')?.setValue(email);
    this.authForm.get('password')?.setValue('password123');
    this.submitAuth();
  }

  submitAuth(): void {
    const val = this.authForm.value;
    const email = val.email || 'guest@aurarestaurant.com';
    const role = this.selectedRole();

    if (this.isRegisterMode()) {
      const name = val.name || email.split('@')[0];
      const phone = val.phone || '+1 (555) 234-5678';
      const ok = this.authService.register(name, email, phone, role);
      if (ok) {
        this.redirectAfterAuth(role);
      }
    } else {
      this.authService.login(email, role);
      this.redirectAfterAuth(role);
    }
  }

  private redirectAfterAuth(role: UserRole): void {
    if (role === 'admin') {
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.router.navigate(['/customer/dashboard']);
    }
  }
}
