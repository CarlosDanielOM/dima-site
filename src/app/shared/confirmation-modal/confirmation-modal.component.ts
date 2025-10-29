import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ConfirmationService, ConfirmRequest } from '../../services/confirmation.service';
import { LanguageService } from '../../services/language.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-confirmation-modal',
    standalone: true,
    imports: [CommonModule, TranslateModule],
    templateUrl: './confirmation-modal.component.html',
    styleUrl: './confirmation-modal.component.css'
})
export class ConfirmationModalComponent implements OnDestroy {
    isOpen = false;
    request: ConfirmRequest | null = null;

    private sub: Subscription;

    constructor(
        private confirmationService: ConfirmationService,
        public languageService: LanguageService
    ) {
        this.sub = this.confirmationService.onConfirm().subscribe(req => {
            this.request = req;
            this.isOpen = true;
        });
    }

    ngOnDestroy(): void {
        this.sub.unsubscribe();
    }

    getCurrentLang(): 'en' | 'es' {
        return this.languageService.getCurrentLanguage();
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


