import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ConfirmationService, ConfirmRequest } from '../../services/confirmation.service';

@Component({
    selector: 'app-confirmation-modal',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './confirmation-modal.component.html',
    styleUrl: './confirmation-modal.component.css'
})
export class ConfirmationModalComponent implements OnDestroy {
    isOpen = false;
    request: ConfirmRequest | null = null;
    lang: 'EN' | 'ES' = (localStorage.getItem('lang') as 'EN' | 'ES') || 'EN';

    private sub: Subscription;

    constructor(private confirmationService: ConfirmationService) {
        this.sub = this.confirmationService.onConfirm().subscribe(req => {
            this.request = req;
            this.isOpen = true;
        });
    }

    ngOnDestroy(): void {
        this.sub.unsubscribe();
    }

    onConfirm() {
        if (this.request) this.request.resolve(true);
        this.close();
    }

    onCancel() {
        if (this.request) this.request.resolve(false);
        this.close();
    }

    close() {
        this.isOpen = false;
        this.request = null;
    }
}


