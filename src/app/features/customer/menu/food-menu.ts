import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { FoodService } from '../../../core/services/food.service';
import { CartService } from '../../../core/services/cart.service';
import { FoodItem } from '../../../core/models/restaurant.models';

@Component({
  selector: 'app-food-menu',
  imports: [CommonModule, RouterLink, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <!-- Menu Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#244B3B]/10 text-[#244B3B] text-xs font-semibold mb-2">
            <mat-icon class="text-sm">menu_book</mat-icon>
            <span>Culinary Offerings</span>
          </div>
          <h1 class="font-serif-luxury text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
            The Aura Menu & Wine List
          </h1>
          <p class="text-stone-600 text-sm mt-1">
            Carefully curated artisanal dishes prepared fresh daily by Chef Antoine and our culinary team.
          </p>
        </div>

        <!-- Search Bar -->
        <div class="w-full md:w-80 relative">
          <mat-icon class="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-lg">search</mat-icon>
          <input
            type="text"
            [value]="searchQuery()"
            (input)="onSearchInput($event)"
            placeholder="Search dishes, ingredients, wines..."
            class="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-stone-300 bg-white text-stone-900 text-sm focus:ring-2 focus:ring-[#244B3B] outline-none transition-all shadow-sm"
          />
          @if (searchQuery()) {
            <button
              type="button"
              (click)="searchQuery.set('')"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <mat-icon class="text-sm">close</mat-icon>
            </button>
          }
        </div>
      </div>

      <!-- Category Filter Pills & Dietary Toggles -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <!-- Categories -->
        <div class="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          <button
            type="button"
            (click)="selectedCategory.set('All')"
            class="px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap shadow-sm"
            [class.bg-[#244B3B]]="selectedCategory() === 'All'"
            [class.text-[#DFC48A]]="selectedCategory() === 'All'"
            [class.bg-white]="selectedCategory() !== 'All'"
            [class.text-stone-700]="selectedCategory() !== 'All'"
            [class.border]="selectedCategory() !== 'All'"
            [class.border-stone-200]="selectedCategory() !== 'All'"
            [class.hover:bg-stone-50]="selectedCategory() !== 'All'"
          >
            All Selections ({{ foodService.foodItems().length }})
          </button>
          @for (cat of foodService.categories; track cat) {
            <button
              type="button"
              (click)="selectedCategory.set(cat)"
              class="px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap shadow-sm"
              [class.bg-[#244B3B]]="selectedCategory() === cat"
              [class.text-[#DFC48A]]="selectedCategory() === cat"
              [class.bg-white]="selectedCategory() !== cat"
              [class.text-stone-700]="selectedCategory() !== cat"
              [class.border]="selectedCategory() !== cat"
              [class.border-stone-200]="selectedCategory() !== cat"
              [class.hover:bg-stone-50]="selectedCategory() !== cat"
            >
              {{ cat }}
            </button>
          }
        </div>

        <!-- Dietary Tag Filter -->
        <div class="flex items-center gap-1.5 self-start sm:self-auto shrink-0">
          <span class="text-xs text-stone-400 font-medium mr-1 hidden lg:inline">Filter:</span>
          <button
            type="button"
            (click)="toggleTag('Chef Special')"
            class="px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors flex items-center gap-1"
            [class.bg-amber-100]="activeTag() === 'Chef Special'"
            [class.border-amber-400]="activeTag() === 'Chef Special'"
            [class.text-amber-900]="activeTag() === 'Chef Special'"
            [class.bg-white]="activeTag() !== 'Chef Special'"
            [class.border-stone-200]="activeTag() !== 'Chef Special'"
            [class.text-stone-600]="activeTag() !== 'Chef Special'"
          >
            <mat-icon class="text-xs text-amber-500">star</mat-icon>
            <span>Chef Special</span>
          </button>

          <button
            type="button"
            (click)="toggleTag('Vegetarian')"
            class="px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors flex items-center gap-1"
            [class.bg-emerald-100]="activeTag() === 'Vegetarian'"
            [class.border-emerald-400]="activeTag() === 'Vegetarian'"
            [class.text-emerald-900]="activeTag() === 'Vegetarian'"
            [class.bg-white]="activeTag() !== 'Vegetarian'"
            [class.border-stone-200]="activeTag() !== 'Vegetarian'"
            [class.text-stone-600]="activeTag() !== 'Vegetarian'"
          >
            <mat-icon class="text-xs text-emerald-600">spa</mat-icon>
            <span>Vegetarian</span>
          </button>
        </div>
      </div>

      <!-- Food Items Grid -->
      @if (filteredItems().length === 0) {
        <div class="bg-white rounded-3xl border border-stone-200 p-12 text-center max-w-lg mx-auto shadow-sm">
          <mat-icon class="text-5xl text-stone-300">search_off</mat-icon>
          <h3 class="text-base font-bold text-stone-800 mt-3">No matching culinary items</h3>
          <p class="text-xs text-stone-500 mt-1">Try resetting your search query or choosing another menu category.</p>
          <button
            type="button"
            (click)="resetFilters()"
            class="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-[#244B3B] text-white hover:bg-[#193529]"
          >
            Reset Filters
          </button>
        </div>
      } @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          @for (food of filteredItems(); track food.id) {
            <div
              class="group bg-white rounded-3xl border border-stone-200/90 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              [class.opacity-60]="!food.isAvailable"
            >
              <!-- Card Media Top -->
              <div>
                <div class="relative h-48 w-full overflow-hidden bg-stone-100">
                  <img
                    [src]="food.image"
                    [alt]="food.name"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerpolicy="no-referrer"
                    loading="lazy"
                  />
                  <!-- Category Overlay Pill -->
                  <div class="absolute top-3 left-3 flex flex-wrap gap-1">
                    <span class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-[#DFC48A] border border-white/10">
                      {{ food.category }}
                    </span>
                  </div>

                  <!-- In Stock / Out of Stock Banner -->
                  @if (!food.isAvailable) {
                    <div class="absolute inset-0 bg-stone-900/70 backdrop-blur-[2px] flex items-center justify-center">
                      <span class="px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-rose-600 text-white shadow-lg">
                        Currently Unavailable
                      </span>
                    </div>
                  }

                  <!-- Rating Pill -->
                  <div class="absolute bottom-3 right-3 px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-md text-white text-[11px] font-semibold flex items-center gap-1 border border-white/10">
                    <mat-icon class="text-xs text-[#DFC48A]">star</mat-icon>
                    <span>{{ food.rating.toFixed(1) }}</span>
                  </div>
                </div>

                <!-- Card Body -->
                <div class="p-5 space-y-2.5">
                  <!-- Dietary Tags -->
                  @if (food.dietaryTags && food.dietaryTags.length > 0) {
                    <div class="flex flex-wrap gap-1">
                      @for (tag of food.dietaryTags; track tag) {
                        <span
                          class="px-2 py-0.5 rounded text-[10px] font-semibold"
                          [ngClass]="{
                            'bg-amber-50 text-amber-900 border border-amber-200': tag === 'Chef Special',
                            'bg-emerald-50 text-emerald-900 border border-emerald-200': tag === 'Vegetarian',
                            'bg-stone-100 text-stone-700': tag !== 'Chef Special' && tag !== 'Vegetarian'
                          }"
                        >
                          {{ tag }}
                        </span>
                      }
                    </div>
                  }

                  <h3 class="font-serif-luxury text-lg font-bold text-stone-900 group-hover:text-[#244B3B] transition-colors leading-snug">
                    {{ food.name }}
                  </h3>

                  <p class="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                    {{ food.description }}
                  </p>

                  <div class="flex items-center gap-3 text-[11px] text-stone-400 pt-1">
                    <span class="flex items-center gap-1">
                      <mat-icon class="text-xs">schedule</mat-icon>
                      {{ food.prepTimeMinutes }} mins
                    </span>
                    @if (food.calories) {
                      <span>&bull; {{ food.calories }} kcal</span>
                    }
                  </div>
                </div>
              </div>

              <!-- Card Bottom / Actions -->
              <div class="p-5 pt-0 border-t border-stone-100 mt-2 flex items-center justify-between">
                <div>
                  <span class="text-[10px] text-stone-400 uppercase font-semibold block">Price</span>
                  <span class="text-lg font-mono font-bold text-[#244B3B]">
                    &dollar;{{ food.price.toFixed(2) }}
                  </span>
                </div>

                <button
                  type="button"
                  (click)="addToCart(food)"
                  [disabled]="!food.isAvailable"
                  class="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs bg-[#244B3B] text-[#FAF9F5] hover:bg-[#193529] active:scale-95 transition-all shadow-md hover:shadow-lg disabled:opacity-40 disabled:pointer-events-none"
                >
                  <mat-icon class="text-sm text-[#DFC48A]">add_shopping_cart</mat-icon>
                  <span>Add to Order</span>
                </button>
              </div>

            </div>
          }
        </div>
      }

      <!-- Sticky Floating Cart Indicator (if items in cart) -->
      @if (cartService.totalItemCount() > 0) {
        <div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 max-w-xl w-full px-4">
          <div class="bg-[#193529] text-white p-4 rounded-2xl shadow-2xl border border-[#DFC48A]/40 flex items-center justify-between gap-4 backdrop-blur-md">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-[#C5A059] text-[#193529] flex items-center justify-center font-bold">
                <mat-icon class="text-xl">shopping_bag</mat-icon>
              </div>
              <div>
                <p class="text-xs text-stone-300 font-medium">
                  {{ cartService.totalItemCount() }} item{{ cartService.totalItemCount() === 1 ? '' : 's' }} selected
                </p>
                <p class="text-sm font-bold text-[#DFC48A]">
                  Total: &dollar;{{ cartService.total().toFixed(2) }} <span class="text-xs text-stone-400 font-normal">(incl. tax)</span>
                </p>
              </div>
            </div>

            <a
              routerLink="/customer/cart"
              class="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#DFC48A] to-[#C5A059] text-[#193529] font-bold text-xs shadow-lg hover:scale-105 transition-all"
            >
              <span>Review Cart & Checkout</span>
              <mat-icon class="text-sm">arrow_forward</mat-icon>
            </a>
          </div>
        </div>
      }

    </div>
  `
})
export class FoodMenu {
  readonly foodService = inject(FoodService);
  readonly cartService = inject(CartService);

  readonly selectedCategory = signal<string>('All');
  readonly searchQuery = signal<string>('');
  readonly activeTag = signal<string>('');

  readonly filteredItems = computed(() => {
    let items = this.foodService.foodItems();
    const cat = this.selectedCategory();
    const query = this.searchQuery().trim().toLowerCase();
    const tag = this.activeTag();

    if (cat !== 'All') {
      items = items.filter(i => i.category === cat);
    }

    if (tag) {
      items = items.filter(i => i.dietaryTags?.includes(tag));
    }

    if (query) {
      items = items.filter(i => 
        i.name.toLowerCase().includes(query) ||
        i.description.toLowerCase().includes(query) ||
        i.category.toLowerCase().includes(query)
      );
    }

    return items;
  });

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  toggleTag(tag: string): void {
    this.activeTag.update(current => current === tag ? '' : tag);
  }

  resetFilters(): void {
    this.selectedCategory.set('All');
    this.searchQuery.set('');
    this.activeTag.set('');
  }

  addToCart(food: FoodItem): void {
    this.cartService.addItem(food, 1);
  }
}
