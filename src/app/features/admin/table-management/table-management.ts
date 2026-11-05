import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { TableService } from '../../../core/services/table.service';
import { BookingService } from '../../../core/services/booking.service';
import { RestaurantTable, TableLocation, TableShape, TableStatus } from '../../../core/models/restaurant.models';

@Component({
  selector: 'app-table-management',
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#244B3B]/10 text-[#244B3B] text-xs font-semibold mb-2">
            <mat-icon class="text-sm">grid_view</mat-icon>
            <span>Floor Architecture & Capacity</span>
          </div>
          <h1 class="font-serif-luxury text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
            Dining Floor & Table Layout
          </h1>
          <p class="text-stone-600 text-sm mt-1">
            Configure restaurant dining tables, adjust seating capacities, assign zones, and toggle live occupancy.
          </p>
        </div>

        <button
          type="button"
          (click)="openAddModal()"
          class="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#244B3B] text-[#FAF9F5] font-bold text-xs shadow-md hover:bg-[#193529] transition-all self-start md:self-auto"
        >
          <mat-icon class="text-base text-[#DFC48A]">add</mat-icon>
          <span>Add New Table</span>
        </button>
      </div>

      <!-- Quick Floor Metrics Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm text-center">
          <p class="text-[10px] text-stone-400 font-bold uppercase">Total Tables</p>
          <p class="text-2xl font-bold text-stone-900 mt-1">{{ tableService.totalTables() }}</p>
        </div>
        <div class="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm text-center">
          <p class="text-[10px] text-emerald-600 font-bold uppercase">Available</p>
          <p class="text-2xl font-bold text-emerald-700 mt-1">{{ tableService.availableTablesCount() }}</p>
        </div>
        <div class="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm text-center">
          <p class="text-[10px] text-amber-600 font-bold uppercase">Occupied / Reserved</p>
          <p class="text-2xl font-bold text-amber-700 mt-1">
            {{ tableService.occupiedTablesCount() + tableService.reservedTablesCount() }}
          </p>
        </div>
        <div class="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm text-center">
          <p class="text-[10px] text-[#244B3B] font-bold uppercase">Total Seating Covers</p>
          <p class="text-2xl font-bold text-[#244B3B] mt-1">{{ tableService.totalSeatingCapacity() }}</p>
        </div>
      </div>

      <!-- Zone Filter Pills -->
      <div class="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          (click)="selectedZone.set('All')"
          class="px-4 py-2 rounded-xl text-xs font-bold transition-all"
          [class.bg-[#244B3B]]="selectedZone() === 'All'"
          [class.text-[#DFC48A]]="selectedZone() === 'All'"
          [class.bg-white]="selectedZone() !== 'All'"
          [class.text-stone-700]="selectedZone() !== 'All'"
          [class.border]="selectedZone() !== 'All'"
          [class.border-stone-200]="selectedZone() !== 'All'"
        >
          All Dining Sections
        </button>
        @for (zone of tableService.getLocations(); track zone) {
          <button
            type="button"
            (click)="selectedZone.set(zone)"
            class="px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap"
            [class.bg-[#244B3B]]="selectedZone() === zone"
            [class.text-[#DFC48A]]="selectedZone() === zone"
            [class.bg-white]="selectedZone() !== zone"
            [class.text-stone-700]="selectedZone() !== zone"
            [class.border]="selectedZone() !== zone"
            [class.border-stone-200]="selectedZone() !== zone"
          >
            {{ zone }}
          </button>
        }
      </div>

      <!-- Visual Floor Plan Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        @for (tbl of filteredTables(); track tbl.id) {
          <div class="bg-white rounded-3xl border border-stone-200/90 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4">
            
            <!-- Table Header -->
            <div>
              <div class="flex items-start justify-between">
                <div class="flex items-center gap-3">
                  <div
                    class="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg font-mono transition-colors"
                    [ngClass]="{
                      'bg-emerald-100 text-emerald-900 border border-emerald-300': tbl.status === 'available',
                      'bg-amber-100 text-amber-900 border border-amber-300': tbl.status === 'occupied',
                      'bg-purple-100 text-purple-900 border border-purple-300': tbl.status === 'reserved',
                      'bg-stone-200 text-stone-700 border border-stone-300': tbl.status === 'maintenance'
                    }"
                  >
                    {{ tbl.number }}
                  </div>
                  <div>
                    <span class="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      {{ tbl.location }}
                    </span>
                    <h3 class="font-bold text-base text-stone-900">Table {{ tbl.number }}</h3>
                  </div>
                </div>

                <!-- Status Selector Pill -->
                <select
                  [value]="tbl.status"
                  (change)="onStatusChange(tbl.id, $event)"
                  class="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg border outline-none cursor-pointer"
                  [ngClass]="{
                    'bg-emerald-50 text-emerald-800 border-emerald-300': tbl.status === 'available',
                    'bg-amber-50 text-amber-800 border-amber-300': tbl.status === 'occupied',
                    'bg-purple-50 text-purple-800 border-purple-300': tbl.status === 'reserved',
                    'bg-stone-100 text-stone-700 border-stone-300': tbl.status === 'maintenance'
                  }"
                >
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="reserved">Reserved</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              <p class="text-xs text-stone-500 mt-3 leading-relaxed">
                {{ tbl.description }}
              </p>
            </div>

            <!-- Details & Actions -->
            <div class="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
              <div class="flex items-center gap-2">
                <span class="inline-flex items-center gap-1 font-bold text-stone-700 bg-stone-100 px-2 py-0.5 rounded-md">
                  <mat-icon class="text-xs">people</mat-icon>
                  {{ tbl.capacity }} Seats
                </span>
                <span class="capitalize text-stone-400">({{ tbl.shape }})</span>
              </div>

              <div class="flex items-center gap-1">
                <button
                  type="button"
                  (click)="openEditModal(tbl)"
                  class="p-1 rounded-md text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                  title="Edit Table"
                >
                  <mat-icon class="text-base">edit</mat-icon>
                </button>
                <button
                  type="button"
                  (click)="deleteTable(tbl.id)"
                  class="p-1 rounded-md text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                  title="Delete Table"
                >
                  <mat-icon class="text-base">delete</mat-icon>
                </button>
              </div>
            </div>

          </div>
        }
      </div>

    </div>

    <!-- Add / Edit Modal -->
    @if (showModal()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div class="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200">
          
          <div class="p-5 bg-[#244B3B] text-white flex items-center justify-between">
            <h3 class="font-serif-luxury text-lg font-semibold tracking-wide flex items-center gap-2">
              <mat-icon class="text-[#DFC48A]">grid_view</mat-icon>
              <span>{{ editingTableId() ? 'Edit Table Settings' : 'Add New Restaurant Table' }}</span>
            </h3>
            <button
              type="button"
              (click)="closeModal()"
              class="text-white/70 hover:text-white"
            >
              <mat-icon>close</mat-icon>
            </button>
          </div>

          <form [formGroup]="tableForm" (ngSubmit)="saveTable()" class="p-6 space-y-4 text-xs">
            
            <div class="grid grid-cols-2 gap-3">
              <!-- Table Number -->
              <div>
                <label for="tableNumberInput" class="block font-bold text-stone-700 uppercase mb-1">Table Number *</label>
                <input
                  id="tableNumberInput"
                  type="text"
                  formControlName="number"
                  placeholder="e.g. T-11"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-mono font-bold focus:ring-2 focus:ring-[#244B3B] outline-none"
                />
              </div>

              <!-- Capacity -->
              <div>
                <label for="tableCapacityInput" class="block font-bold text-stone-700 uppercase mb-1">Capacity (Seats) *</label>
                <input
                  id="tableCapacityInput"
                  type="number"
                  formControlName="capacity"
                  min="1"
                  max="20"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-[#244B3B] outline-none"
                />
              </div>
            </div>

            <!-- Location / Zone & Shape -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label for="tableLocationSelect" class="block font-bold text-stone-700 uppercase mb-1">Floor Section *</label>
                <select
                  id="tableLocationSelect"
                  formControlName="location"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-[#244B3B] outline-none cursor-pointer"
                >
                  @for (loc of tableService.getLocations(); track loc) {
                    <option [value]="loc">{{ loc }}</option>
                  }
                </select>
              </div>

              <div>
                <label for="tableShapeSelect" class="block font-bold text-stone-700 uppercase mb-1">Shape / Setup *</label>
                <select
                  id="tableShapeSelect"
                  formControlName="shape"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-[#244B3B] outline-none cursor-pointer"
                >
                  <option value="round">Round</option>
                  <option value="rect">Rectangular</option>
                  <option value="booth">VIP Booth</option>
                </select>
              </div>
            </div>

            <!-- Description -->
            <div>
              <label for="tableDescInput" class="block font-bold text-stone-700 uppercase mb-1">Atmosphere / Seating Description *</label>
              <textarea
                id="tableDescInput"
                formControlName="description"
                rows="2"
                placeholder="Overlooking the courtyard, banquette seating, ambient lighting..."
                class="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-[#244B3B] outline-none resize-none"
              ></textarea>
            </div>

            <!-- Minimum Spend -->
            <div>
              <label for="tableSpendInput" class="block font-bold text-stone-700 uppercase mb-1">Minimum Spend ($ optional for VIP)</label>
              <input
                id="tableSpendInput"
                type="number"
                formControlName="minSpend"
                placeholder="250"
                class="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-[#244B3B] outline-none font-mono"
              />
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
                [disabled]="tableForm.invalid"
                class="px-5 py-2.5 rounded-xl bg-[#244B3B] text-white font-bold text-xs hover:bg-[#193529] disabled:opacity-50"
              >
                {{ editingTableId() ? 'Save Changes' : 'Create Table' }}
              </button>
            </div>
          </form>

        </div>
      </div>
    }
  `
})
export class TableManagement {
  readonly tableService = inject(TableService);
  readonly bookingService = inject(BookingService);

  readonly selectedZone = signal<string>('All');
  readonly showModal = signal<boolean>(false);
  readonly editingTableId = signal<string | null>(null);

  readonly tableForm = new FormGroup({
    number: new FormControl('', [Validators.required]),
    capacity: new FormControl<number>(4, [Validators.required, Validators.min(1), Validators.max(20)]),
    location: new FormControl<TableLocation>('Main Dining', [Validators.required]),
    shape: new FormControl<TableShape>('rect', [Validators.required]),
    description: new FormControl('', [Validators.required]),
    minSpend: new FormControl<number | null>(null)
  });

  readonly filteredTables = computed(() => {
    const list = this.tableService.tables();
    const zone = this.selectedZone();
    if (zone === 'All') return list;
    return list.filter(t => t.location === zone);
  });

  onStatusChange(id: string, event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.tableService.setTableStatus(id, select.value as TableStatus);
  }

  deleteTable(id: string): void {
    if (confirm('Are you sure you wish to delete this table?')) {
      this.tableService.deleteTable(id);
    }
  }

  openAddModal(): void {
    this.editingTableId.set(null);
    this.tableForm.reset({
      number: 'T-' + (this.tableService.totalTables() + 1).toString().padStart(2, '0'),
      capacity: 4,
      location: 'Main Dining',
      shape: 'rect',
      description: 'Comfortable table setting in the dining room.',
      minSpend: null
    });
    this.showModal.set(true);
  }

  openEditModal(table: RestaurantTable): void {
    this.editingTableId.set(table.id);
    this.tableForm.setValue({
      number: table.number,
      capacity: table.capacity,
      location: table.location,
      shape: table.shape,
      description: table.description,
      minSpend: table.minSpend ?? null
    });
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingTableId.set(null);
  }

  saveTable(): void {
    if (this.tableForm.invalid) {
      this.tableForm.markAllAsTouched();
      return;
    }

    const val = this.tableForm.value;
    const editingId = this.editingTableId();

    if (editingId) {
      const existing = this.tableService.getTableById(editingId);
      if (existing) {
        this.tableService.updateTable({
          ...existing,
          number: val.number!,
          capacity: val.capacity!,
          location: val.location as TableLocation,
          shape: val.shape as TableShape,
          description: val.description!,
          minSpend: val.minSpend ?? undefined
        });
      }
    } else {
      this.tableService.addTable({
        number: val.number!,
        capacity: val.capacity!,
        location: val.location as TableLocation,
        shape: val.shape as TableShape,
        status: 'available',
        description: val.description!,
        minSpend: val.minSpend ?? undefined
      });
    }

    this.closeModal();
  }
}
