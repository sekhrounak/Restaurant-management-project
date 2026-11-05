import { Routes } from '@angular/router';

export const routes: Routes = [
  // Auth
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/login').then(m => m.Login)
  },

  // Customer Routes
  {
    path: 'customer/dashboard',
    loadComponent: () => import('./features/customer/dashboard/customer-dashboard').then(m => m.CustomerDashboard)
  },
  {
    path: 'customer/booking',
    loadComponent: () => import('./features/customer/booking/table-booking').then(m => m.TableBooking)
  },
  {
    path: 'customer/menu',
    loadComponent: () => import('./features/customer/menu/food-menu').then(m => m.FoodMenu)
  },
  {
    path: 'customer/cart',
    loadComponent: () => import('./features/customer/cart/shopping-cart').then(m => m.ShoppingCart)
  },
  {
    path: 'customer/reservations',
    loadComponent: () => import('./features/customer/reservations/customer-reservations').then(m => m.CustomerReservations)
  },
  {
    path: 'customer/orders',
    loadComponent: () => import('./features/customer/orders/customer-orders').then(m => m.CustomerOrders)
  },

  // Admin Routes
  {
    path: 'admin/dashboard',
    loadComponent: () => import('./features/admin/dashboard/admin-dashboard').then(m => m.AdminDashboard)
  },
  {
    path: 'admin/reservations',
    loadComponent: () => import('./features/admin/reservations/admin-reservations').then(m => m.AdminReservations)
  },
  {
    path: 'admin/orders',
    loadComponent: () => import('./features/admin/orders/admin-orders').then(m => m.AdminOrders)
  },
  {
    path: 'admin/menu-management',
    loadComponent: () => import('./features/admin/menu-management/menu-management').then(m => m.MenuManagement)
  },
  {
    path: 'admin/table-management',
    loadComponent: () => import('./features/admin/table-management/table-management').then(m => m.TableManagement)
  },
  {
    path: 'admin/customers',
    loadComponent: () => import('./features/admin/customers/customer-management').then(m => m.CustomerManagement)
  },

  // Redirects
  {
    path: '',
    redirectTo: 'customer/dashboard',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'customer/dashboard'
  }
];
