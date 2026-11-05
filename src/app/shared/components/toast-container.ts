import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none px-4 sm:px-0">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="pointer-events-auto bg-white border rounded-xl shadow-xl p-4 transition-all duration-300 flex items-start gap-3 relative overflow-hidden"
          [ngClass]="{
            'border-emerald-600/30 shadow-emerald-950/10': toast.type === 'success',
            'border-rose-500/30 shadow-rose-950/10': toast.type === 'error',
            'border-amber-500/30 shadow-amber-950/10': toast.type === 'warning',
            'border-sky-500/30 shadow-sky-950/10': toast.type === 'info'
          }"
        >
          <!-- Left accent strip -->
          <div
            class="absolute left-0 top-0 bottom-0 w-1.5"
            [ngClass]="{
              'bg-[#244B3B]': toast.type === 'success',
              'bg-rose-600': toast.type === 'error',
              'bg-amber-500': toast.type === 'warning',
              'bg-sky-600': toast.type === 'info'
            }"
          ></div>

          <div class="shrink-0 mt-0.5">
            @if (toast.type === 'success') {
              <div class="w-8 h-8 rounded-full bg-emerald-100 text-[#244B3B] flex items-center justify-center">
                <mat-icon class="text-lg">check_circle</mat-icon>
              </div>
            } @else if (toast.type === 'error') {
              <div class="w-8 h-8 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center">
                <mat-icon class="text-lg">error</mat-icon>
              </div>
            } @else if (toast.type === 'warning') {
              <div class="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                <mat-icon class="text-lg">warning</mat-icon>
              </div>
            } @else {
              <div class="w-8 h-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center">
                <mat-icon class="text-lg">info</mat-icon>
              </div>
            }
          </div>

          <div class="flex-1 min-w-0 pr-2">
            <h4 class="text-sm font-semibold text-stone-900 leading-tight">{{ toast.title }}</h4>
            <p class="text-xs text-stone-600 mt-1 leading-relaxed">{{ toast.message }}</p>
          </div>

          <button
            type="button"
            (click)="toastService.dismiss(toast.id)"
            class="text-stone-400 hover:text-stone-700 transition-colors p-1 -mr-1 rounded-md"
            aria-label="Dismiss toast"
          >
            <mat-icon class="text-sm">close</mat-icon>
          </button>
        </div>
      }
    </div>
  `
})
export class ToastContainer {
  readonly toastService = inject(ToastService);
}
