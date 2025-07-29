import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemesService {
  isDarkMode = signal(false);

  constructor() {
    this.initializeTheme();
  }

  private initializeTheme(): void {
    const storedPreference = localStorage.getItem('darkmode');
    if (storedPreference !== null) {
      this.isDarkMode.set(storedPreference === 'true');
      console.log('Setting darkmode from localStorage', this.isDarkMode());
    } else {
      this.isDarkMode.set(
        window.matchMedia('(prefers-color-scheme: dark)').matches
      );
      console.log('Setting darkmode from matchMedia', this.isDarkMode());
    }
    this.updateHtmlClass();
  }

  toggleTheme(): void {
    this.isDarkMode.set(!this.isDarkMode());
    localStorage.setItem('darkmode', String(this.isDarkMode()));
    this.updateHtmlClass();
  }

  private updateHtmlClass(): void {
    if (this.isDarkMode()) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}
