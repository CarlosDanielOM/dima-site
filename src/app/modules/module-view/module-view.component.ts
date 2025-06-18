import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Construction, LucideAngularModule, Crown } from 'lucide-angular';

@Component({
  selector: 'app-module-view',
  standalone: true,
  imports: [RouterModule, CommonModule, LucideAngularModule],
  templateUrl: './module-view.component.html',
  styleUrl: './module-view.component.css'
})
export class ModuleViewComponent {
  lang: 'EN' | 'ES' = localStorage.getItem('lang') as 'EN' | 'ES' || 'EN';
  constructionIcon = Construction;
  crownIcon = Crown;
  
  modules = [
    {
      name: 'Clips',
      path: 'clips',
      icon: 'video',
      description: {
        EN: 'Select a clip viewer design and adjust settings.',
        ES: 'Selecciona un diseño de visualizador de clips y ajusta los ajustes.'
      },
      disabled: false,
      disabled_message: 'This module is not available yet. Please check back later.',
      disabled_icon: 'lock',
      disabled_color: 'bg-red-500',
      disabled_text_color: 'text-white',
      premium: false,
      premium_plus: false
    },
    {
      name: 'Chat Events',
      path: 'events',
      icon: 'calendar',
      description: {
        EN: 'Enable or disable chat events, like follows, bits, subs, etc, and set their respective messages and thresholds.',
        ES: 'Activa o desactiva eventos de chat, como follows, bits, subs, etc, y establece sus respectivos mensajes y umbrales.'
      },
      disabled: true,
      disabled_message: 'This module is not available yet. Please check back later.',
      disabled_icon: 'lock',
      disabled_color: 'bg-red-500',
      disabled_text_color: 'text-white',
      premium: false,
      premium_plus: false
    },
    {
      name: 'Triggers',
      path: 'triggers',
      icon: 'settings',
      description: {
        EN: 'Create, edit, and manage triggers for your content. Triggers are short videos that can be triggered by twitch rewards.',
        ES: 'Crea, edita y gestiona triggers para tu contenido. Los triggers son videos cortos que pueden ser activados por recompensas de Twitch.'
      },
      disabled: true,
      disabled_message: 'This module is not available yet. Please check back later.',
      disabled_icon: 'lock',
      disabled_color: 'bg-red-500',
      disabled_text_color: 'text-white',
      premium: false,
      premium_plus: false
    },
  ];
}
