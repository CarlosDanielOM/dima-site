import { Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';

import { LanguageService } from '../services/language.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';

type TranslationEntry = { en: string; es: string };

const ACCENT_PRESETS = {
  emerald: {
    accent: '52 211 153',
    accentHover: '16 185 129',
    accentText: '167 243 208',
    accentContrast: '15 23 42'
  },
  sky: {
    accent: '56 189 248',
    accentHover: '14 165 233',
    accentText: '186 230 253',
    accentContrast: '8 47 73'
  },
  amber: {
    accent: '251 191 36',
    accentHover: '245 158 11',
    accentText: '254 243 199',
    accentContrast: '69 26 3'
  },
  rose: {
    accent: '244 114 182',
    accentHover: '236 72 153',
    accentText: '251 207 232',
    accentContrast: '76 5 25'
  }
} as const;

type AccentKey = keyof typeof ACCENT_PRESETS;
type ColorValue = typeof ACCENT_PRESETS[AccentKey][keyof typeof ACCENT_PRESETS[AccentKey]];


interface WipRouteConfig {
  progress?: number;
  accent?: AccentKey;
  status?: Partial<TranslationEntry>;
}

@Component({
  selector: 'app-wip',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './wip.component.html',
  styleUrls: ['./wip.component.css']
})
export class WipComponent implements OnInit, OnDestroy {
  highlights: Array<{ icon: string; translationKey: string }> = [
    { icon: '🚀', translationKey: 'wip.highlights.0' },
    { icon: '🤖', translationKey: 'wip.highlights.1' },
    { icon: '🎨', translationKey: 'wip.highlights.2' }
  ];

  @HostBinding('style.--accent')
  accentVariable: ColorValue = ACCENT_PRESETS.emerald.accent;

  @HostBinding('style.--accent-hover')
  accentHoverVariable: ColorValue = ACCENT_PRESETS.emerald.accentHover;

  @HostBinding('style.--accent-text')
  accentTextVariable: ColorValue = ACCENT_PRESETS.emerald.accentText;

  @HostBinding('style.--accent-contrast')
  accentContrastVariable: ColorValue = ACCENT_PRESETS.emerald.accentContrast;

  private readonly defaultConfig: Required<Pick<WipRouteConfig, 'progress' | 'accent'>> = {
    progress: 75,
    accent: 'emerald'
  };

  progressValue = this.defaultConfig.progress;
  customStatus?: TranslationEntry;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly languageService: LanguageService,
    private readonly activatedRoute: ActivatedRoute,
    public translate: TranslateService
  ) {}

  ngOnInit(): void {
    // Ensure language is properly initialized
    const currentLang = this.languageService.getCurrentLanguage();
    if (!this.translate.currentLang) {
      this.translate.use(currentLang);
    }
    
    this.activatedRoute.data.pipe(takeUntil(this.destroy$)).subscribe(data => {
      this.applyRouteConfig(data['wip'] as WipRouteConfig | undefined);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  get progressStrokeDasharray(): string {
    return `${this.progressValue} 100`;
  }

  get progressStrokeDashoffset(): number {
    return 100 - this.progressValue;
  }

  get progressDisplay(): string {
    return `${Math.round(this.progressValue)}%`;
  }

  getProgressStatusText(): string {
    if (this.customStatus) {
      const template = this.languageService.getTranslation(this.customStatus);
      return template.replace('%PROGRESS%', `${Math.round(this.progressValue)}`);
    }
    const template = this.translate.instant('wip.progressStatusTemplate');
    return template.replace('%PROGRESS%', `${Math.round(this.progressValue)}`);
  }

  private applyRouteConfig(config?: WipRouteConfig): void {
    const accentKey = this.resolveAccent(config?.accent);
    this.setAccentVariables(accentKey);
    this.progressValue = this.normalizeProgress(config?.progress);
    this.customStatus = this.resolvePartialTranslation(config?.status) ?? undefined;
    // Note: copy and highlights overrides are not fully supported with ngx-translate
    // They would need to be handled differently if needed
  }

  private resolveAccent(accent?: AccentKey): AccentKey {
    if (accent && ACCENT_PRESETS[accent]) {
      return accent;
    }
    return this.defaultConfig.accent;
  }

  private setAccentVariables(accent: AccentKey): void {
    const preset = ACCENT_PRESETS[accent];
    this.accentVariable = preset.accent;
    this.accentHoverVariable = preset.accentHover;
    this.accentTextVariable = preset.accentText;
    this.accentContrastVariable = preset.accentContrast;
  }

  private normalizeProgress(progress?: number): number {
    if (typeof progress !== 'number' || Number.isNaN(progress)) {
      return this.defaultConfig.progress;
    }

    const clamped = Math.min(100, Math.max(0, progress));
    return Math.round(clamped * 100) / 100;
  }

  private resolvePartialTranslation(partial?: Partial<TranslationEntry>): TranslationEntry | null {
    if (!partial) {
      return null;
    }

    // Fallback uses translation file - get both languages
    // Use LanguageService to get the current language, not translate.currentLang
    // which might not be initialized yet on refresh
    const currentLang = this.languageService.getCurrentLanguage();
    
    this.translate.use('en');
    const fallbackEn = this.translate.instant('wip.progressStatusTemplate');
    this.translate.use('es');
    const fallbackEs = this.translate.instant('wip.progressStatusTemplate');
    // Restore to the actual current language from LanguageService
    this.translate.use(currentLang);

    return {
      en: partial.en ?? fallbackEn,
      es: partial.es ?? fallbackEs
    } satisfies TranslationEntry;
  }
}
