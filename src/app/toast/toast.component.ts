import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { LucideAngularModule, CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-angular';
import { Toast, ToastService, ToastType } from '../toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css']
})
export class ToastComponent implements OnInit, OnDestroy {
  @Input() id = 'default-toast';
  
  toasts: Toast[] = [];
  toastSubscription!: Subscription;

  // Icon mapping
  checkCircleIcon = CheckCircle;
  xCircleIcon = XCircle;
  infoIcon = Info;
  alertTriangleIcon = AlertTriangle;
  xIcon = X;

  constructor(private toastService: ToastService) { }

  ngOnInit() {
    this.toastSubscription = this.toastService.onToast()
      .subscribe(toast => {
        if (!toast.message) {
          this.toasts = [];
          return;
        }
        this.toasts.push(toast);
        if (toast.autoClose) {
          setTimeout(() => this.removeToast(toast), 3000);
        }
      });
  }

  ngOnDestroy() {
    this.toastSubscription.unsubscribe();
  }

  removeToast(toast: Toast) {
    if (!this.toasts.includes(toast)) return;
    this.toasts = this.toasts.filter(x => x.id !== toast.id);
  }

  cssClass(toast: Toast) {
    if (!toast) return '';

    const classes = ['shadow-lg', 'rounded-lg', 'flex', 'p-4'];
    const toastTypeClasses = {
      [ToastType.Success]: 'bg-green-100 text-green-800',
      [ToastType.Error]: 'bg-red-100 text-red-800',
      [ToastType.Info]: 'bg-blue-100 text-blue-800',
      [ToastType.Warning]: 'bg-yellow-100 text-yellow-800',
    };
    classes.push(toastTypeClasses[toast.type]);
    return classes.join(' ');
  }

  icon(toast: Toast) {
    const iconMap = {
        [ToastType.Success]: this.checkCircleIcon,
        [ToastType.Error]: this.xCircleIcon,
        [ToastType.Info]: this.infoIcon,
        [ToastType.Warning]: this.alertTriangleIcon
    };
    return iconMap[toast.type];
  }
}
