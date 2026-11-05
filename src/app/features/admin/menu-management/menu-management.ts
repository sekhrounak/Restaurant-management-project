import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { FoodService } from '../../../core/services/food.service';
import { FoodCategory, FoodItem } from '../../../core/models/restaurant.models';

@Component({
  selector: 'app-menu-management',
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#244B3B]/10 text-[#244B3B] text-xs font-semibold mb-2">
            <mat-icon class="text-sm">restaurant_menu</mat-icon>
            <span>Culinary Master Catalog</span>
          </div>
          <h1 class="font-serif-luxury text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
            Menu Item Management
          </h1>
          <p class="text-stone-600 text-sm mt-1">
            Create new seasonal courses, calibrate prices, adjust prep times, and toggle 86'd ingredient availability.
          </p>
        </div>

        <button
          type="button"
          (click)="openAddModal()"
          class="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#244B3B] text-[#FAF9F5] font-bold text-xs shadow-md hover:bg-[#193529] transition-all self-start md:self-auto"
        >
          <mat-icon class="text-base text-[#DFC48A]">add</mat-icon>
          <span>Create New Dish</span>
        </button>
      </div>

      <!-- Filters & Metrics -->
      <div class="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <!-- Category Filter -->
        <div class="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          <button
            type="button"
            (click)="selectedCategory.set('All')"
            class="px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors"
            [class.bg-[#244B3B]]="selectedCategory() === 'All'"
            [class.text-[#DFC48A]]="selectedCategory() === 'All'"
            [class.bg-stone-100]="selectedCategory() !== 'All'"
            [class.text-stone-700]="selectedCategory() !== 'All'"
          >
            All ({{ foodService.totalItemsCount() }})
          </button>
          @for (cat of foodService.categories; track cat) {
            <button
              type="button"
              (click)="selectedCategory.set(cat)"
              class="px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors"
              [class.bg-[#244B3B]]="selectedCategory() === cat"
              [class.text-[#DFC48A]]="selectedCategory() === cat"
              [class.bg-stone-100]="selectedCategory() !== cat"
              [class.text-stone-700]="selectedCategory() !== cat"
            >
              {{ cat }}
            </button>
          }
        </div>

        <!-- Search Input -->
        <div class="relative w-full sm:w-72">
          <mat-icon class="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">search</mat-icon>
          <input
            type="text"
            [value]="searchQuery()"
            (input)="onSearchInput($event)"
            placeholder="Search dish name..."
            class="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 text-xs bg-[#FAF9F5] focus:ring-2 focus:ring-[#244B3B] outline-none"
          />
        </div>
      </div>

      <!-- Food Items List -->
      <div class="bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-[#FAF9F5] border-b border-stone-200 text-stone-500 uppercase text-[11px] font-bold tracking-wider">
                <th class="py-4 px-6">Dish & Category</th>
                <th class="py-4 px-6">Description</th>
                <th class="py-4 px-6">Price</th>
                <th class="py-4 px-6">Prep Time</th>
                <th class="py-4 px-6">Status</th>
                <th class="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-stone-100 text-xs">
              @for (food of filteredItems(); track food.id) {
                <tr class="hover:bg-stone-50/80 transition-colors" [class.opacity-60]="!food.isAvailable">
                  
                  <!-- Dish Info -->
                  <td class="py-4 px-6">
                    <div class="flex items-center gap-3">
                      <img
                        [src]="food.image"
                        [alt]="food.name"
                        class="w-12 h-12 rounded-xl object-cover border border-stone-200 shrink-0"
                        referrerpolicy="no-referrer"
                      />
                      <div>
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-stone-100 text-[#244B3B]">
                          {{ food.category }}
                        </span>
                        <p class="font-bold text-stone-900 text-sm mt-0.5">{{ food.name }}</p>
                      </div>
                    </div>
                  </td>

                  <!-- Description -->
                  <td class="py-4 px-6 max-w-xs">
                    <p class="text-stone-600 line-clamp-2 leading-relaxed">
                      {{ food.description }}
                    </p>
                  </td>

                  <!-- Price -->
                  <td class="py-4 px-6 font-mono font-bold text-sm text-[#244B3B]">
                    &dollar;{{ food.price.toFixed(2) }}
                  </td>

                  <!-- Prep Time -->
                  <td class="py-4 px-6">
                    <span class="font-semibold text-stone-700 flex items-center gap-1">
                      <mat-icon class="text-xs text-stone-400">schedule</mat-icon>
                      {{ food.prepTimeMinutes }} mins
                    </span>
                  </td>

                  <!-- Availability Toggle Switch -->
                  <td class="py-4 px-6">
                    <button
                      type="button"
                      (click)="toggleAvailability(food.id)"
                      class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1"
                      [class.bg-emerald-100]="food.isAvailable"
                      [class.text-emerald-800]="food.isAvailable"
                      [class.bg-rose-100]="!food.isAvailable"
                      [class.text-rose-800]="!food.isAvailable"
                      title="Click to toggle availability"
                    >
                      <mat-icon class="text-xs">{{ food.isAvailable ? 'check_circle' : 'do_not_disturb_on' }}</mat-icon>
                      <span>{{ food.isAvailable ? 'Available' : 'Unavailable' }}</span>
                    </button>
                  </td>

                  <!-- Actions -->
                  <td class="py-4 px-6 text-right">
                    <div class="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        (click)="openEditModal(food)"
                        class="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                        title="Edit Dish"
                      >
                        <mat-icon class="text-base">edit</mat-icon>
                      </button>
                      <button
                        type="button"
                        (click)="deleteDish(food.id)"
                        class="p-1.5 rounded-lg text-rose-600 hover:text-rose-800 hover:bg-rose-50 transition-colors"
                        title="Delete Dish"
                      >
                        <mat-icon class="text-base">delete</mat-icon>
                      </button>
                    </div>
                  </td>

                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

    </div>

    <!-- Add / Edit Modal -->
    @if (showModal()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div class="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-stone-200 max-h-[90vh] flex flex-col">
          
          <div class="p-5 bg-[#244B3B] text-white flex items-center justify-between">
            <h3 class="font-serif-luxury text-lg font-semibold tracking-wide flex items-center gap-2">
              <mat-icon class="text-[#DFC48A]">restaurant</mat-icon>
              <span>{{ editingFoodId() ? 'Update Menu Course' : 'Create New Menu Course' }}</span>
            </h3>
            <button
              type="button"
              (click)="closeModal()"
              class="text-white/70 hover:text-white"
            >
              <mat-icon>close</mat-icon>
            </button>
          </div>

          <form [formGroup]="foodForm" (ngSubmit)="saveDish()" class="p-6 overflow-y-auto space-y-4 text-xs">
            
            <!-- Name -->
            <div>
              <label for="courseTitle" class="block font-bold text-stone-700 uppercase mb-1">Course Title *</label>
              <input
                id="courseTitle"
                type="text"
                formControlName="name"
                placeholder="e.g., Pan-Roasted Chilean Sea Bass"
                class="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-[#244B3B] outline-none"
              />
            </div>

            <!-- Category & Price -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label for="courseCat" class="block font-bold text-stone-700 uppercase mb-1">Category *</label>
                <select
                  id="courseCat"
                  formControlName="category"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold focus:ring-2 focus:ring-[#244B3B] outline-none cursor-pointer"
                >
                  @for (cat of foodService.categories; track cat) {
                    <option [value]="cat">{{ cat }}</option>
                  }
                </select>
              </div>

              <div>
                <label for="coursePrice" class="block font-bold text-stone-700 uppercase mb-1">Price ($) *</label>
                <input
                  id="coursePrice"
                  type="number"
                  step="0.5"
                  formControlName="price"
                  placeholder="24.00"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-mono font-bold focus:ring-2 focus:ring-[#244B3B] outline-none"
                />
              </div>
            </div>

            <!-- Prep Time & Calories -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label for="coursePrep" class="block font-bold text-stone-700 uppercase mb-1">Prep Time (mins) *</label>
                <input
                  id="coursePrep"
                  type="number"
                  formControlName="prepTimeMinutes"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#244B3B] outline-none"
                />
              </div>

              <div>
                <label for="courseCalories" class="block font-bold text-stone-700 uppercase mb-1">Calories (optional)</label>
                <input
                  id="courseCalories"
                  type="number"
                  formControlName="calories"
                  placeholder="550"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#244B3B] outline-none"
                />
              </div>
            </div>

            <!-- Image URL -->
            <div>
              <label for="courseImg" class="block font-bold text-stone-700 uppercase mb-1">Culinary Photography URL *</label>
              <input
                id="courseImg"
                type="url"
                formControlName="image"
                placeholder="https://images.unsplash.com/photo-..."
                class="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#244B3B] outline-none"
              />
              <p class="text-[11px] text-stone-400 mt-1">Preset curated photos available below for 1-click apply:</p>
              
              <!-- Quick image presets -->
              <div class="flex gap-2 mt-1.5 overflow-x-auto pb-1">
                @for (preset of imagePresets; track preset.label) {
                  <button
                    type="button"
                    (click)="foodForm.get('image')?.setValue(preset.url)"
                    class="px-2 py-1 rounded bg-stone-100 hover:bg-stone-200 text-[10px] font-semibold text-stone-700 whitespace-nowrap"
                  >
                    {{ preset.label }}
                  </button>
                }
              </div>
            </div>

            <!-- Description -->
            <div>
              <label for="courseDesc" class="block font-bold text-stone-700 uppercase mb-1">Gourmet Description *</label>
              <textarea
                id="courseDesc"
                formControlName="description"
                rows="3"
                placeholder="Detailed description of flavors, ingredients, provenance and pairings..."
                class="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#244B3B] outline-none resize-none"
              ></textarea>
            </div>

            <div class="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
              <button
                type="button"
                (click)="closeModal()"
                class="px-4 py-2 rounded-xl text-stone-600 font-semibold hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                [disabled]="foodForm.invalid"
                class="px-5 py-2.5 rounded-xl bg-[#244B3B] text-white font-bold text-xs hover:bg-[#193529] disabled:opacity-50"
              >
                {{ editingFoodId() ? 'Update Dish' : 'Add Dish to Menu' }}
              </button>
            </div>
          </form>

        </div>
      </div>
    }
  `
})
export class MenuManagement {
  readonly foodService = inject(FoodService);

  readonly selectedCategory = signal<string>('All');
  readonly searchQuery = signal<string>('');
  readonly showModal = signal<boolean>(false);
  readonly editingFoodId = signal<string | null>(null);

  readonly imagePresets = [
    { label: 'Steak', url: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=600&q=80' },
    { label: 'Salmon', url: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=600&q=80' },
    { label: 'Pizza', url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80' },
    { label: 'Pasta', url: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281788?auto=format&fit=crop&w=600&q=80' },
    { label: 'Cocktail', url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=600&q=80' },
    { label: 'Dessert', url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80' }
  ];

  readonly foodForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    category: new FormControl<FoodCategory>('Main Course', [Validators.required]),
    price: new FormControl<number>(24.00, [Validators.required, Validators.min(1)]),
    prepTimeMinutes: new FormControl<number>(15, [Validators.required, Validators.min(1)]),
    calories: new FormControl<number | null>(null),
    image: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required, Validators.minLength(10)])
  });

  readonly filteredItems = computed(() => {
    let list = this.foodService.foodItems();
    const cat = this.selectedCategory();
    const query = this.searchQuery().trim().toLowerCase();

    if (cat !== 'All') {
      list = list.filter(i => i.category === cat);
    }
    if (query) {
      list = list.filter(i => i.name.toLowerCase().includes(query) || i.description.toLowerCase().includes(query));
    }
    return list;
  });

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  toggleAvailability(id: string): void {
    this.foodService.toggleAvailability(id);
  }

  deleteDish(id: string): void {
    if (confirm('Are you sure you wish to delete this item from the active menu?')) {
      this.foodService.deleteFood(id);
    }
  }

  openAddModal(): void {
    this.editingFoodId.set(null);
    this.foodForm.reset({
      name: '',
      category: 'Main Course',
      price: 24.00,
      prepTimeMinutes: 15,
      calories: null,
      image: this.imagePresets[0].url,
      description: ''
    });
    this.showModal.set(true);
  }

  openEditModal(item: FoodItem): void {
    this.editingFoodId.set(item.id);
    this.foodForm.setValue({
      name: item.name,
      category: item.category,
      price: item.price,
      prepTimeMinutes: item.prepTimeMinutes,
      calories: item.calories ?? null,
      image: item.image,
      description: item.description
    });
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingFoodId.set(null);
  }

  saveDish(): void {
    if (this.foodForm.invalid) {
      this.foodForm.markAllAsTouched();
      return;
    }

    const val = this.foodForm.value;
    const editingId = this.editingFoodId();

    if (editingId) {
      const existing = this.foodService.getItemById(editingId);
      if (existing) {
        this.foodService.updateFood({
          ...existing,
          name: val.name!,
          category: val.category as FoodCategory,
          price: val.price!,
          prepTimeMinutes: val.prepTimeMinutes!,
          calories: val.calories ?? undefined,
          image: val.image!,
          description: val.description!
        });
      }
    } else {
      this.foodService.addFood({
        name: val.name!,
        category: val.category as FoodCategory,
        price: val.price!,
        prepTimeMinutes: val.prepTimeMinutes!,
        calories: val.calories ?? undefined,
        image: val.image!,
        description: val.description!,
        isAvailable: true,
        rating: 4.9,
        dietaryTags: ['Chef Special']
      });
    }

    this.closeModal();
  }
}
