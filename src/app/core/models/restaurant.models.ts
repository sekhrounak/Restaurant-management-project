export type UserRole = 'customer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  preferences?: string;
}

export type TableLocation = 'Window Side' | 'Main Dining' | 'Terrace Patio' | 'VIP Lounge' | 'Chef Bar';
export type TableShape = 'round' | 'rect' | 'booth';
export type TableStatus = 'available' | 'occupied' | 'reserved' | 'maintenance';

export interface RestaurantTable {
  id: string;
  number: string;
  capacity: number;
  location: TableLocation;
  shape: TableShape;
  status: TableStatus;
  description: string;
  minSpend?: number;
}

export type FoodCategory = 'Starters' | 'Main Course' | 'Pizza' | 'Burgers' | 'Drinks' | 'Desserts';

export interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: FoodCategory;
  image: string;
  isAvailable: boolean;
  rating: number;
  prepTimeMinutes: number;
  dietaryTags?: string[]; // e.g. ['Chef Special', 'Vegetarian', 'Gluten-Free']
  calories?: number;
}

export interface CartItem {
  foodItem: FoodItem;
  quantity: number;
  specialInstructions?: string;
}

export type ReservationStatus = 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled' | 'Rejected';

export interface Reservation {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  tableId: string;
  tableNumber: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "19:00"
  guests: number;
  status: ReservationStatus;
  specialRequests?: string;
  createdAt: string;
  notes?: string;
}

export type OrderStatus = 'Received' | 'Confirmed' | 'Preparing' | 'Ready' | 'Delivered' | 'Cancelled';

export interface OrderItem {
  foodId: string;
  name: string;
  price: number;
  quantity: number;
  category: FoodCategory;
  image: string;
}

export interface FoodOrder {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  orderDate: string; // ISO string
  status: OrderStatus;
  deliveryType: 'Dine-In' | 'Takeaway' | 'Delivery';
  tableNumber?: string;
  notes?: string;
  paymentStatus: 'Paid' | 'Pending';
  paymentMethod: 'Credit Card' | 'Cash on Dine-in' | 'Digital Wallet';
}

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  timestamp: number;
}
