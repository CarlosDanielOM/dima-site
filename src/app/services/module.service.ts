import { Injectable } from '@angular/core';
import { Video, Calendar, Settings } from 'lucide-angular';
import { Observable, of } from 'rxjs';
import { ReleaseStage } from '../interfaces/releasestage';
import { StageInfo } from '../interfaces/stageinfo';
import { Module } from '../interfaces/module';

@Injectable({
  providedIn: 'root',
})
export class ModuleService {
  constructor() {}

  getModules(): Observable<Module[]> {
    // In a real app, this would fetch from a backend API.
    // This represents the global configuration for all modules on the site.
    const mockModules: Module[] = [
      {
        name: 'Clips',
        path: 'clips',
        icon: Video,
        description: {
          en: 'Select a clip viewer design and adjust settings.',
          es: 'Selecciona un diseño de visualizador de clips y ajusta los ajustes.',
        },
        releaseStage: 'stable',
        premium: false,
        premium_plus: false,
      },
      {
        name: 'Chat Events',
        path: 'chat-events',
        icon: Calendar,
        description: {
          en: 'Enable or disable chat events, like follows, bits, subs, etc, and set their respective messages and thresholds.',
          es: 'Activa o desactiva eventos de chat, como follows, bits, subs, etc, y establece sus respectivos mensajes y umbrales.',
        },
        releaseStage: 'stable',
        premium: false,
        premium_plus: false,
      },
      {
        name: 'Triggers',
        path: 'triggers',
        icon: Settings,
        description: {
          en: 'Create, edit, and manage triggers for your content. Triggers are short videos that can be triggered by twitch rewards.',
          es: 'Crea, edita y gestiona triggers para tu contenido. Los triggers son videos cortos que pueden ser activados por recompensas de Twitch.',
        },
        releaseStage: 'coming_soon',
        premium: true,
        premium_plus: true,
      },
      {
        name: 'Redemptions',
        path: 'redemptions',
        icon: Settings,
        description: {
          en: 'Create, edit, and manage redemptions for your content. Redemptions are rewards that can be redeemed by viewers.',
          es: 'Crea, edita y gestiona redemptions para tu contenido. Las redemptions son recompensas que pueden ser canjeadas por los espectadores.',
        },
        releaseStage: 'alpha',
        premium: true,
        premium_plus: true,
      },
    ];
    return of(mockModules);
  }
}
