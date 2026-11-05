import { Injectable, computed, inject, signal } from '@angular/core';
import { User, UserRole } from '../models/restaurant.models';
import { INITIAL_USERS } from '../models/mock-data';
import { StorageService } from './storage.service';
import { ToastService } from './toast.service';

const USERS_STORAGE_KEY = 'aura_users_v1';
const CURRENT_USER_KEY = 'aura_current_user_v1';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private storage = inject(StorageService);
  private toast = inject(ToastService);

  private readonly _users = signal<User[]>([]);
  private readonly _currentUser = signal<User | null>(null);

  readonly users = this._users.asReadonly();
  readonly currentUser = this._currentUser.asReadonly();
  readonly currentRole = computed<UserRole>(() => this._currentUser()?.role ?? 'customer');
  readonly isAuthenticated = computed<boolean>(() => this._currentUser() !== null);
  readonly isAdmin = computed<boolean>(() => this.currentRole() === 'admin');

  constructor() {
    this.initUsers();
  }

  private initUsers(): void {
    const savedUsers = this.storage.getItem<User[]>(USERS_STORAGE_KEY, INITIAL_USERS);
    this._users.set(savedUsers);

    const savedCurrentUser = this.storage.getItem<User | null>(CURRENT_USER_KEY, null);
    if (savedCurrentUser && savedUsers.some(u => u.id === savedCurrentUser.id)) {
      this._currentUser.set(savedCurrentUser);
    } else {
      // Default to the first customer user for immediate preview readiness
      const defaultUser = savedUsers.find(u => u.role === 'customer') ?? savedUsers[0];
      this._currentUser.set(defaultUser);
      this.storage.setItem(CURRENT_USER_KEY, defaultUser);
    }
  }

  login(email: string, role: UserRole = 'customer'): boolean {
    const existing = this._users().find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      this._currentUser.set(existing);
      this.storage.setItem(CURRENT_USER_KEY, existing);
      this.toast.showSuccess('Welcome Back', `Logged in as ${existing.name} (${existing.role})`);
      return true;
    }

    // If user doesn't exist, create demo session for this role
    const newUser: User = {
      id: 'user_' + Date.now().toString(36),
      name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      email,
      role,
      createdAt: new Date().toISOString()
    };
    this.addUser(newUser);
    this._currentUser.set(newUser);
    this.storage.setItem(CURRENT_USER_KEY, newUser);
    this.toast.showSuccess('Welcome to Aura', `Account initialized as ${newUser.name}`);
    return true;
  }

  register(name: string, email: string, phone: string, role: UserRole = 'customer'): boolean {
    const existing = this._users().find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      this.toast.showError('Registration Failed', 'An account with this email address already exists.');
      return false;
    }

    const newUser: User = {
      id: 'user_' + Date.now().toString(36),
      name,
      email,
      phone,
      role,
      createdAt: new Date().toISOString()
    };
    this.addUser(newUser);
    this._currentUser.set(newUser);
    this.storage.setItem(CURRENT_USER_KEY, newUser);
    this.toast.showSuccess('Account Created', `Welcome to Aura Table & Bar, ${newUser.name}!`);
    return true;
  }

  logout(): void {
    const name = this._currentUser()?.name ?? 'User';
    this._currentUser.set(null);
    this.storage.removeItem(CURRENT_USER_KEY);
    this.toast.showInfo('Signed Out', `Goodbye ${name}. See you soon!`);
  }

  /**
   * Quick role switcher for demo & testing convenience
   */
  switchRole(targetRole: UserRole): void {
    const targetUser = this._users().find(u => u.role === targetRole);
    if (targetUser) {
      this._currentUser.set(targetUser);
      this.storage.setItem(CURRENT_USER_KEY, targetUser);
      this.toast.showInfo('Switched Mode', `Now viewing Aura as ${targetUser.name} (${targetUser.role.toUpperCase()})`);
    } else {
      // Create template user for target role
      const tempUser: User = {
        id: 'user_' + targetRole + '_' + Date.now().toString(36),
        name: targetRole === 'admin' ? 'Executive General Manager' : 'Guest Diner',
        email: targetRole === 'admin' ? 'manager@aurarestaurant.com' : 'guest@example.com',
        role: targetRole,
        createdAt: new Date().toISOString()
      };
      this.addUser(tempUser);
      this._currentUser.set(tempUser);
      this.storage.setItem(CURRENT_USER_KEY, tempUser);
      this.toast.showInfo('Switched Mode', `Now operating as ${tempUser.name}`);
    }
  }

  updateProfile(name: string, phone: string, preferences?: string): void {
    const current = this._currentUser();
    if (!current) return;

    const updated: User = {
      ...current,
      name,
      phone,
      preferences
    };

    this._currentUser.set(updated);
    this._users.update(users => users.map(u => u.id === updated.id ? updated : u));
    this.storage.setItem(CURRENT_USER_KEY, updated);
    this.storage.setItem(USERS_STORAGE_KEY, this._users());
    this.toast.showSuccess('Profile Updated', 'Your profile details have been successfully saved.');
  }

  private addUser(user: User): void {
    this._users.update(list => [...list, user]);
    this.storage.setItem(USERS_STORAGE_KEY, this._users());
  }
}
