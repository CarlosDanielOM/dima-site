import { Injectable, signal } from '@angular/core';

export type SupportedLanguage = 'en' | 'es';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private readonly STORAGE_KEY = 'userLanguage';
  private readonly DEFAULT_LANGUAGE: SupportedLanguage = 'en';

  // Available languages with their display names
  readonly availableLanguages = {
    en: { code: 'en', name: 'English', nativeName: 'English' },
    es: { code: 'es', name: 'Spanish', nativeName: 'Español' }
  } as const;

  // Current language signal
  currentLanguage = signal<SupportedLanguage>(this.DEFAULT_LANGUAGE);

  constructor() {
    this.initializeLanguage();
  }

  /**
   * Initialize language on first load
   * Checks localStorage first, then falls back to browser language
   */
  private initializeLanguage(): void {
    const storedLanguage = this.getStoredLanguage();

    if (storedLanguage && this.isValidLanguage(storedLanguage)) {
      this.currentLanguage.set(storedLanguage);
      console.log('Language set from localStorage:', storedLanguage);
    } else {
      const browserLanguage = this.detectBrowserLanguage();
      this.currentLanguage.set(browserLanguage);
      this.saveLanguageToStorage(browserLanguage);
      console.log('Language set from browser preference:', browserLanguage);
    }
  }

  /**
   * Detect browser's preferred language
   */
  private detectBrowserLanguage(): SupportedLanguage {
    const browserLang = navigator.language.toLowerCase();

    // Check for exact matches first
    if (browserLang === 'en' || browserLang.startsWith('en-')) {
      return 'en';
    }
    if (browserLang === 'es' || browserLang.startsWith('es-')) {
      return 'es';
    }

    // Check for partial matches (e.g., 'en-US', 'es-MX')
    if (browserLang.includes('en')) {
      return 'en';
    }
    if (browserLang.includes('es')) {
      return 'es';
    }

    // Default fallback
    return this.DEFAULT_LANGUAGE;
  }

  /**
   * Get stored language from localStorage
   */
  private getStoredLanguage(): SupportedLanguage | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored as SupportedLanguage;
    } catch (error) {
      console.warn('Could not read language from localStorage:', error);
      return null;
    }
  }

  /**
   * Save language to localStorage
   */
  private saveLanguageToStorage(language: SupportedLanguage): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, language);
    } catch (error) {
      console.warn('Could not save language to localStorage:', error);
    }
  }

  /**
   * Check if a language code is valid/supported
   */
  private isValidLanguage(lang: string): lang is SupportedLanguage {
    return lang === 'en' || lang === 'es';
  }

  /**
   * Get current language
   */
  getCurrentLanguage(): SupportedLanguage {
    return this.currentLanguage();
  }

  /**
   * Set language and persist to storage
   */
  setLanguage(language: SupportedLanguage): void {
    if (!this.isValidLanguage(language)) {
      console.warn(`Unsupported language: ${language}. Using default.`);
      language = this.DEFAULT_LANGUAGE;
    }

    this.currentLanguage.set(language);
    this.saveLanguageToStorage(language);
    console.log('Language changed to:', language);
  }

  /**
   * Toggle between available languages
   */
  toggleLanguage(): void {
    const current = this.getCurrentLanguage();
    const newLanguage = current === 'en' ? 'es' : 'en';
    this.setLanguage(newLanguage);
  }

  /**
   * Get language display information
   */
  getLanguageInfo(language: SupportedLanguage) {
    return this.availableLanguages[language];
  }

  /**
   * Get all available languages
   */
  getAvailableLanguages() {
    return Object.values(this.availableLanguages);
  }

  /**
   * Check if current language is a specific language
   */
  isCurrentLanguage(language: SupportedLanguage): boolean {
    return this.getCurrentLanguage() === language;
  }

  /**
   * Get translated text based on current language
   * This is a helper method for components to easily get translations
   */
  getTranslation(translations: Record<SupportedLanguage, string> | Record<string, string> | { EN?: string; ES?: string; en?: string; es?: string }): string {
    const currentLang = this.getCurrentLanguage();
    const defaultLang = this.DEFAULT_LANGUAGE;

    // Try exact match first (lowercase keys)
    if (translations[currentLang as keyof typeof translations]) {
      return translations[currentLang as keyof typeof translations] as string;
    }

    // Try uppercase keys as fallback (EN, ES)
    const upperCurrentLang = currentLang.toUpperCase();
    if (translations[upperCurrentLang as keyof typeof translations]) {
      return translations[upperCurrentLang as keyof typeof translations] as string;
    }

    // Try default language exact match
    if (translations[defaultLang as keyof typeof translations]) {
      return translations[defaultLang as keyof typeof translations] as string;
    }

    // Try default language uppercase
    const upperDefaultLang = defaultLang.toUpperCase();
    if (translations[upperDefaultLang as keyof typeof translations]) {
      return translations[upperDefaultLang as keyof typeof translations] as string;
    }

    // If no translation found, return the first available string value
    const firstValue = Object.values(translations as Record<string, string>)[0];
    if (typeof firstValue === 'string') {
      return firstValue;
    }

    // Ultimate fallback
    return 'Translation not found';
  }
}
