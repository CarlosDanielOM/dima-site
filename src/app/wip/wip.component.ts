import { Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';

import { LanguageService } from '../services/language.service';
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

const BASE_TRANSLATIONS = {
  statusChip: {
    en: 'In active development',
    es: 'En desarrollo activo'
  },
  headline: {
    en: 'We are crafting something extraordinary',
    es: 'Estamos creando algo extraordinario'
  },
  description: {
    en: 'Our team is polishing the next big experience for the DIMA ecosystem. We are ensuring every interaction feels smooth, responsive, and delightful.',
    es: 'Nuestro equipo está puliendo la próxima gran experiencia para el ecosistema DIMA. Queremos que cada interacción sea fluida, receptiva y encantadora.'
  },
  progressTitle: {
    en: 'Current status',
    es: 'Estado actual'
  },
  progressDescription: {
    en: 'The core features are implemented. We are focusing on refining real-time performance, accessibility, and internationalization.',
    es: 'Las funciones principales ya están implementadas. Nos enfocamos en refinar el rendimiento en tiempo real, la accesibilidad y la internacionalización.'
  },
  progressStatusTemplate: {
    en: '%PROGRESS%% complete · Launch window: Q4 2025',
    es: '%PROGRESS%% completado · Ventana de lanzamiento: Q4 2025'
  },
  whatToExpectTitle: {
    en: 'What to expect',
    es: 'Qué esperar'
  },
  whatToExpectIntro: {
    en: 'Here is a quick glimpse at what is landing with the first release.',
    es: 'Aquí tienes un vistazo rápido de lo que llegará con el primer lanzamiento.'
  },
  backHome: {
    en: 'Go back home',
    es: 'Volver al inicio'
  },
  stayTunedLabel: {
    en: 'Stay tuned for updates',
    es: 'Mantente al tanto de las novedades'
  },
  footerNote: {
    en: 'Need early access or have feedback? Reach out to the team and we will get you onboarded as soon as possible.',
    es: '¿Necesitas acceso anticipado o tienes comentarios? Comunícate con el equipo y te integraremos lo antes posible.'
  }
} satisfies Record<string, TranslationEntry>;

type BaseTranslationKey = keyof typeof BASE_TRANSLATIONS;
type BaseTranslationMap = Record<BaseTranslationKey, TranslationEntry>;

interface WipHighlight {
  icon: string;
  translations: TranslationEntry;
}

const BASE_HIGHLIGHTS = [
  {
    icon: '🚀',
    translations: {
      en: 'Streamlined management dashboards with real-time analytics.',
      es: 'Paneles de gestión optimizados con analíticas en tiempo real.'
    }
  },
  {
    icon: '🤖',
    translations: {
      en: 'Smart automations that react instantly to your community events.',
      es: 'Automatizaciones inteligentes que reaccionan al instante a los eventos de tu comunidad.'
    }
  },
  {
    icon: '🎨',
    translations: {
      en: 'Tailwind-powered themes designed to match your brand personality.',
      es: 'Temas impulsados por Tailwind diseñados para reflejar la personalidad de tu marca.'
    }
  }
] satisfies readonly WipHighlight[];

const HIGHLIGHT_FALLBACK: WipHighlight = {
  icon: '✨',
  translations: {
    en: 'More enhancements are on the way. Stay tuned!',
    es: 'Más mejoras están en camino. ¡Mantente atento!'
  }
};

interface WipRouteConfig {
  progress?: number;
  accent?: AccentKey;
  status?: Partial<TranslationEntry>;
  copy?: Partial<Record<BaseTranslationKey, Partial<TranslationEntry>>>;
  highlights?: Array<Partial<WipHighlight>>;
}

@Component({
  selector: 'app-wip',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './wip.component.html',
  styleUrls: ['./wip.component.css']
})
export class WipComponent implements OnInit, OnDestroy {
  private translations: BaseTranslationMap = { ...BASE_TRANSLATIONS };
  highlights: WipHighlight[] = [...BASE_HIGHLIGHTS];

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
    private readonly activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.pipe(takeUntil(this.destroy$)).subscribe(data => {
      this.applyRouteConfig(data['wip'] as WipRouteConfig | undefined);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getTranslation(key: BaseTranslationKey): string {
    return this.languageService.getTranslation(this.translations[key]);
  }

  getHighlightTranslation(
    highlight: WipHighlight
  ): string {
    return this.languageService.getTranslation(highlight.translations);
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
    const translations = this.customStatus ?? this.translations.progressStatusTemplate;
    const template = this.languageService.getTranslation(translations);
    return template.replace('%PROGRESS%', `${Math.round(this.progressValue)}`);
  }

  private applyRouteConfig(config?: WipRouteConfig): void {
    const accentKey = this.resolveAccent(config?.accent);
    this.setAccentVariables(accentKey);
    this.progressValue = this.normalizeProgress(config?.progress);
    this.customStatus = this.resolvePartialTranslation(config?.status) ?? undefined;
    this.translations = this.buildTranslationMap(config?.copy);
    this.highlights = this.buildHighlights(config?.highlights);
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

    const fallback = BASE_TRANSLATIONS.progressStatusTemplate;

    return {
      en: partial.en ?? fallback.en,
      es: partial.es ?? fallback.es
    } satisfies TranslationEntry;
  }

  private buildTranslationMap(overrides?: WipRouteConfig['copy']): BaseTranslationMap {
    if (!overrides) {
      return { ...BASE_TRANSLATIONS };
    }

    const merged: Partial<BaseTranslationMap> = {};

    (Object.keys(BASE_TRANSLATIONS) as BaseTranslationKey[]).forEach(key => {
      const baseEntry = BASE_TRANSLATIONS[key];
      const override = overrides[key];

      if (!override) {
        merged[key] = baseEntry;
        return;
      }

      merged[key] = {
        en: override.en ?? baseEntry.en,
        es: override.es ?? baseEntry.es
      } satisfies TranslationEntry;
    });

    return merged as BaseTranslationMap;
  }

  private buildHighlights(overrides?: Array<Partial<WipHighlight>>): WipHighlight[] {
    if (!overrides || overrides.length === 0) {
      return [...BASE_HIGHLIGHTS];
    }

    return overrides.map(override => {
      const base = override.icon
        ? BASE_HIGHLIGHTS.find(h => h.icon === override.icon) ?? HIGHLIGHT_FALLBACK
        : HIGHLIGHT_FALLBACK;

      const translations = this.mergeTranslationEntry(
        override.translations,
        base.translations
      );

      return {
        icon: override.icon ?? base.icon,
        translations
      } satisfies WipHighlight;
    });
  }

  private mergeTranslationEntry(
    override: Partial<TranslationEntry> | undefined,
    fallback: TranslationEntry
  ): TranslationEntry {
    if (!override) {
      return fallback;
    }

    return {
      en: override.en ?? fallback.en,
      es: override.es ?? fallback.es
    } satisfies TranslationEntry;
  }
}
