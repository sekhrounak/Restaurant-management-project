import { Injectable, computed, inject, signal } from '@angular/core';
import { RestaurantTable, TableLocation, TableStatus } from '../models/restaurant.models';
import { INITIAL_TABLES } from '../models/mock-data';
import { StorageService } from './storage.service';
import { ToastService } from './toast.service';

const TABLES_STORAGE_KEY = 'aura_tables_v1';

@Injectable({
  providedIn: 'root'
})
export class TableService {
  private storage = inject(StorageService);
  private toast = inject(ToastService);

  private readonly _tables = signal<RestaurantTable[]>([]);
  readonly tables = this._tables.asReadonly();

  readonly totalTables = computed(() => this._tables().length);
  readonly availableTablesCount = computed(() => this._tables().filter(t => t.status === 'available').length);
  readonly occupiedTablesCount = computed(() => this._tables().filter(t => t.status === 'occupied').length);
  readonly reservedTablesCount = computed(() => this._tables().filter(t => t.status === 'reserved').length);
  readonly totalSeatingCapacity = computed(() => this._tables().reduce((sum, t) => sum + t.capacity, 0));

  constructor() {
    this.initTables();
  }

  private initTables(): void {
    const saved = this.storage.getItem<RestaurantTable[]>(TABLES_STORAGE_KEY, INITIAL_TABLES);
    this._tables.set(saved);
  }

  private saveTables(): void {
    this.storage.setItem(TABLES_STORAGE_KEY, this._tables());
  }

  getTableById(id: string): RestaurantTable | undefined {
    return this._tables().find(t => t.id === id);
  }

  addTable(tableData: Omit<RestaurantTable, 'id'>): RestaurantTable {
    const newTable: RestaurantTable = {
      ...tableData,
      id: 'tbl_' + Date.now().toString(36)
    };
    this._tables.update(list => [...list, newTable]);
    this.saveTables();
    this.toast.showSuccess('Table Added', `Table ${newTable.number} (${newTable.capacity} guests) has been registered.`);
    return newTable;
  }

  updateTable(updatedTable: RestaurantTable): void {
    this._tables.update(list => list.map(t => t.id === updatedTable.id ? updatedTable : t));
    this.saveTables();
    this.toast.showSuccess('Table Updated', `Table ${updatedTable.number} details were updated.`);
  }

  deleteTable(id: string): void {
    const table = this.getTableById(id);
    this._tables.update(list => list.filter(t => t.id !== id));
    this.saveTables();
    this.toast.showInfo('Table Removed', `Table ${table?.number ?? id} was removed from the dining floor.`);
  }

  setTableStatus(id: string, status: TableStatus): void {
    this._tables.update(list => list.map(t => {
      if (t.id === id) {
        return { ...t, status };
      }
      return t;
    }));
    this.saveTables();
  }

  getLocations(): TableLocation[] {
    return ['Window Side', 'Main Dining', 'Terrace Patio', 'VIP Lounge', 'Chef Bar'];
  }
}
