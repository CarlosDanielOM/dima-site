import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Construction } from 'lucide-angular';

@Component({
  selector: 'app-wip',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './wip.component.html',
  styleUrl: './wip.component.css'
})
export class WipComponent {
  currentLanguage: 'en' | 'es' = 'en';

  toggleLanguage(): void {
    this.currentLanguage = this.currentLanguage === 'en' ? 'es' : 'en';
  }

  get messages() {
    return {
      en: {
        title: 'Work in Progress',
        subtitle: 'This page is under construction',
        message: 'We are working hard to bring you this feature. Please check back later!'
      },
      es: {
        title: 'Trabajo en Progreso',
        subtitle: 'Esta página está en construcción',
        message: 'Estamos trabajando arduamente para traerte esta función. ¡Vuelve pronto!'
      }
    };
  }

  get currentMessages() {
    return this.messages[this.currentLanguage];
  }
}
