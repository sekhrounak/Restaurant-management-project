import { Injectable, computed, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { BookingService } from './booking.service';
import { OrderService } from './order.service';
import { User } from '../models/restaurant.models';

export interface CustomerSummary {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  createdAt: string;
  totalReservations: number;
  totalOrders: number;
  totalSpent: number;
  lastActive: string;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private authService = inject(AuthService);
  private bookingService = inject(BookingService);
  private orderService = inject(OrderService);

  readonly customers = computed<User[]>(() => {
    return this.authService.users().filter(u => u.role === 'customer');
  });

  readonly totalCustomersCount = computed(() => this.customers().length);

  readonly customerSummaries = computed<CustomerSummary[]>(() => {
    const custs = this.customers();
    const allReservations = this.bookingService.reservations();
    const allOrders = this.orderService.orders();

    return custs.map(c => {
      const custRes = allReservations.filter(r => r.customerId === c.id || r.customerEmail.toLowerCase() === c.email.toLowerCase());
      const custOrders = allOrders.filter(o => o.customerId === c.id || o.customerEmail.toLowerCase() === c.email.toLowerCase());
      const totalSpent = custOrders.filter(o => o.status !== 'Cancelled').reduce((sum, o) => sum + o.total, 0);

      // Find latest activity
      let latest = c.createdAt;
      custRes.forEach(r => {
        if (r.createdAt > latest) latest = r.createdAt;
      });
      custOrders.forEach(o => {
        if (o.orderDate > latest) latest = o.orderDate;
      });

      return {
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        avatar: c.avatar,
        createdAt: c.createdAt,
        totalReservations: custRes.length,
        totalOrders: custOrders.length,
        totalSpent: Math.round(totalSpent * 100) / 100,
        lastActive: latest
      };
    });
  });
}
