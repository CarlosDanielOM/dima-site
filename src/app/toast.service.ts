import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

export interface Toast {
  id?: number;
  type: ToastType;
  title: string;
  message: string;
  autoClose?: boolean;
  keepAfterRouteChange?: boolean;
}

export enum ToastType {
  Success,
  Error,
  Info,
  Warning
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private subject = new Subject<Toast>();
  private defaultId = 'default-toast';

  // enable subscribing to toasts observable
  onToast(): Observable<Toast> {
    return this.subject.asObservable();
  }

  // convenience methods
  success(title: string, message: string, autoClose: boolean = true) {
    this.toast({ type: ToastType.Success, title, message, autoClose });
  }

  error(title: string, message: string, autoClose: boolean = true) {
    this.toast({ type: ToastType.Error, title, message, autoClose });
  }

  info(title: string, message: string, autoClose: boolean = true) {
    this.toast({ type: ToastType.Info, title, message, autoClose });
  }

  warn(title: string, message: string, autoClose: boolean = true) {
    this.toast({ type: ToastType.Warning, title, message, autoClose });
  }

  // main toast method    
  toast(toast: Toast) {
    toast.id = toast.id || new Date().getTime();
    this.subject.next(toast);
  }

  // clear toasts
  clear(id = this.defaultId) {
    this.subject.next({ id: id } as unknown as Toast);
  }
}
