import { Injectable, signal } from '@angular/core';
import { ToastNotification } from '../models/restaurant.models';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private readonly _toasts = signal<ToastNotification[]>([]);
  readonly toasts = this._toasts.asReadonly();

  show(type: ToastNotification['type'], title: string, message: string, durationMs = 4500): void {
    const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const newToast: ToastNotification = {
      id,
      type,
      title,
      message,
      timestamp: Date.now()
    };

    this._toasts.update(list => [...list, newToast]);

    if (durationMs > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, durationMs);
    }
  }

  showSuccess(title: string, message: string): void {
    this.show('success', title, message);
  }

  showError(title: string, message: string): void {
    this.show('error', title, message, 6000);
  }

  showInfo(title: string, message: string): void {
    this.show('info', title, message);
  }

  showWarning(title: string, message: string): void {
    this.show('warning', title, message, 5000);
  }

  dismiss(id: string): void {
    this._toasts.update(list => list.filter(t => t.id !== id));
  }
}
