import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export interface BilingualText {
    EN: string;
    ES: string;
}

export interface ConfirmOptions {
    title: BilingualText;
    message: BilingualText;
    confirmText?: BilingualText;
    cancelText?: BilingualText;
    variant?: 'default' | 'danger';
}

export interface ConfirmRequest extends ConfirmOptions {
    resolve: (result: boolean) => void;
}

@Injectable({ providedIn: 'root' })
export class ConfirmationService {
    private requestSubject = new Subject<ConfirmRequest>();

    onConfirm(): Observable<ConfirmRequest> {
        return this.requestSubject.asObservable();
    }

    confirm(options: ConfirmOptions): Promise<boolean> {
        const defaultOptions: ConfirmOptions = {
            title: { EN: 'Confirm', ES: 'Confirmar' },
            message: { EN: 'Are you sure?', ES: '¿Estás seguro?' },
            confirmText: { EN: 'Confirm', ES: 'Confirmar' },
            cancelText: { EN: 'Cancel', ES: 'Cancelar' },
            variant: 'default'
        };
        const merged = { ...defaultOptions, ...options } as ConfirmOptions;
        return new Promise<boolean>((resolve) => {
            this.requestSubject.next({ ...merged, resolve });
        });
    }
}


