import { Injectable, computed, inject, signal } from '@angular/core';
import { Reservation, ReservationStatus } from '../models/restaurant.models';
import { INITIAL_RESERVATIONS } from '../models/mock-data';
import { StorageService } from './storage.service';
import { ToastService } from './toast.service';
import { TableService } from './table.service';

const RESERVATIONS_STORAGE_KEY = 'aura_reservations_v1';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private storage = inject(StorageService);
  private toast = inject(ToastService);
  private tableService = inject(TableService);

  private readonly _reservations = signal<Reservation[]>([]);
  readonly reservations = this._reservations.asReadonly();

  readonly totalReservations = computed(() => this._reservations().length);

  readonly todayBookingsCount = computed(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return this._reservations().filter(r => r.date === todayStr && r.status !== 'Cancelled' && r.status !== 'Rejected').length;
  });

  readonly pendingCount = computed(() => this._reservations().filter(r => r.status === 'Pending').length);
  readonly confirmedCount = computed(() => this._reservations().filter(r => r.status === 'Confirmed').length);

  constructor() {
    this.initReservations();
  }

  private initReservations(): void {
    const saved = this.storage.getItem<Reservation[]>(RESERVATIONS_STORAGE_KEY, INITIAL_RESERVATIONS);
    this._reservations.set(saved);
  }

  private saveReservations(): void {
    this.storage.setItem(RESERVATIONS_STORAGE_KEY, this._reservations());
  }

  getReservationById(id: string): Reservation | undefined {
    return this._reservations().find(r => r.id === id);
  }

  getByCustomerId(customerId: string): Reservation[] {
    return this._reservations().filter(r => r.customerId === customerId);
  }

  /**
   * Check if a table is already booked for the exact same date & time slot
   */
  isTableBooked(tableId: string, date: string, timeSlot: string, excludeReservationId?: string): boolean {
    return this._reservations().some(r => 
      r.tableId === tableId &&
      r.date === date &&
      r.timeSlot === timeSlot &&
      (r.status === 'Confirmed' || r.status === 'Pending') &&
      (!excludeReservationId || r.id !== excludeReservationId)
    );
  }

  /**
   * Create a new reservation with duplicate/conflict prevention
   */
  createReservation(data: {
    customerId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    tableId: string;
    tableNumber: string;
    date: string;
    timeSlot: string;
    guests: number;
    specialRequests?: string;
  }): { success: boolean; reservation?: Reservation; error?: string } {
    // 1. Validate collision
    if (this.isTableBooked(data.tableId, data.date, data.timeSlot)) {
      const err = `Table ${data.tableNumber} is already reserved for ${data.date} at ${data.timeSlot}. Please select another time or table.`;
      this.toast.showError('Reservation Conflict', err);
      return { success: false, error: err };
    }

    // 2. Generate unique booking ID
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newReservation: Reservation = {
      ...data,
      id: `RES-${randomSuffix}`,
      status: 'Confirmed',
      createdAt: new Date().toISOString()
    };

    this._reservations.update(list => [newReservation, ...list]);
    this.saveReservations();

    // Mark table status if reservation is for today
    const todayStr = new Date().toISOString().split('T')[0];
    if (data.date === todayStr) {
      this.tableService.setTableStatus(data.tableId, 'reserved');
    }

    this.toast.showSuccess(
      'Reservation Confirmed!',
      `Booking ID: ${newReservation.id} at Table ${newReservation.tableNumber} for ${newReservation.guests} guests on ${newReservation.date} (${newReservation.timeSlot}).`
    );

    return { success: true, reservation: newReservation };
  }

  /**
   * Customer action: Cancel reservation
   */
  cancelReservation(id: string, reason?: string): boolean {
    const reservation = this.getReservationById(id);
    if (!reservation) {
      this.toast.showError('Error', 'Reservation not found.');
      return false;
    }

    if (reservation.status === 'Cancelled' || reservation.status === 'Completed') {
      this.toast.showWarning('Notice', `Reservation is already ${reservation.status.toLowerCase()}.`);
      return false;
    }

    this._reservations.update(list => list.map(r => {
      if (r.id === id) {
        return {
          ...r,
          status: 'Cancelled',
          notes: reason ? `Cancelled by guest: ${reason}` : 'Cancelled by guest.'
        };
      }
      return r;
    }));
    this.saveReservations();
    this.toast.showInfo('Reservation Cancelled', `Reservation ${id} was cancelled.`);
    return true;
  }

  /**
   * Admin actions: Update status (Confirmed, Rejected, Cancelled, Completed)
   */
  updateReservationStatus(id: string, status: ReservationStatus, adminNote?: string): void {
    const res = this.getReservationById(id);
    if (!res) return;

    this._reservations.update(list => list.map(r => {
      if (r.id === id) {
        return {
          ...r,
          status,
          notes: adminNote || r.notes
        };
      }
      return r;
    }));
    this.saveReservations();

    if (status === 'Confirmed') {
      this.toast.showSuccess('Reservation Confirmed', `Booking ${id} for ${res.customerName} has been confirmed.`);
    } else if (status === 'Rejected') {
      this.toast.showWarning('Reservation Rejected', `Booking ${id} was rejected.`);
    } else {
      this.toast.showInfo('Status Updated', `Booking ${id} marked as ${status}.`);
    }
  }
}
