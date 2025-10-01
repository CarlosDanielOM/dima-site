import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { LinksService } from '../links.service';
import { UserService } from '../user.service';
import { LanguageService } from '../services/language.service';
import { LucideAngularModule } from 'lucide-angular';
import { CountUpDirective } from '../directives/count-up.directive';
import {
  Activity,
  Tv,
  Users,
  MessageCircle,
  Zap,
  Settings,
  Check,
} from 'lucide-angular';
import { environment } from '../../environments/environment';
import { WebsocketService } from '../services/websocket.service';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [LucideAngularModule, CountUpDirective],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css'
})

export class LandingPageComponent implements OnInit, OnDestroy {

  refferal: string = '';
  twitchAuthUrl: string = '';
  activityIcon = Activity;
  tvIcon = Tv;
  usersIcon = Users;
  messageCircleIcon = MessageCircle;
  zapIcon = Zap;
  settingsIcon = Settings;
  checkIcon = Check;

  siteStats = {
    activeChannels: 40,
    liveChannels: 8,
    registeredChannels: 63
  }

  private analyticsNamespaces = [
    '/site/analytics/active-channels',
    '/site/analytics/live-channels',
    '/site/analytics/registered-channels'
  ];

  constructor(
    private router: Router,
    private linksService: LinksService,
    private userService: UserService,
    private websocketService: WebsocketService,
    private languageService: LanguageService
  ) {
    let scope = encodeURIComponent('user:read:email');
    this.twitchAuthUrl = `${this.linksService.getTwitchAuthUrl()}&scope=${scope}`;
  }

  ngOnInit(): void {
    this.connectAnalyticsNamespaces();
    this.setupAnalyticsListeners();
    this.handleReferral();

    // Scroll reveal: fade/slide in elements when they enter viewport
    if (typeof window !== 'undefined') {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-in');
            entry.target.classList.remove('reveal-init');
            observer.unobserve(entry.target);
          }
        })
      }, { threshold: 0.15 });

      document.querySelectorAll('.reveal-init').forEach((el) => {
        observer.observe(el);
      });

      // Parallax for aurora blobs
      const parallaxContainers = document.querySelectorAll<HTMLElement>('.parallax-layer');
      const onScroll = () => {
        const scrollY = window.scrollY || window.pageYOffset;
        parallaxContainers.forEach(layer => {
          const depthAttr = layer.getAttribute('data-depth');
          const depth = depthAttr ? parseFloat(depthAttr) : 0.05;
          const translateY = Math.round(scrollY * depth);
          layer.style.transform = `translate3d(0, ${translateY}px, 0)`;
        });
      };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
    }
  }

  ngOnDestroy(): void {
    // Cleanup websocket namespace connections
    this.analyticsNamespaces.forEach(ns => {
      this.websocketService.disconnectNamespace(ns);
    });
  }

  private async connectAnalyticsNamespaces(): Promise<void> {
    try {
      // Connect to all analytics namespaces
      await Promise.all(this.analyticsNamespaces.map(ns => this.websocketService.connectNamespace(ns)));
      console.log('WebSocket namespace connections established for analytics');
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
    }
  }

  private setupAnalyticsListeners(): void {
    // Active channels (expects event name 'active-channels')
    this.websocketService.onNamespace('/site/analytics/active-channels', 'active-channels', (data: any) => {
      const value = this.extractCount(data, ['active', 'count']);
      if (typeof value === 'number') this.siteStats.activeChannels = value;
    });

    // Live channels (expects event name 'live-channels')
    this.websocketService.onNamespace('/site/analytics/live-channels', 'live-channels', (data: any) => {
      const value = this.extractCount(data, ['live', 'count']);
      if (typeof value === 'number') this.siteStats.liveChannels = value;
    });

    // Registered channels (expects event name 'registered-channels')
    this.websocketService.onNamespace('/site/analytics/registered-channels', 'registered-channels', (data: any) => {
      const value = this.extractCount(data, ['registered', 'count']);
      if (typeof value === 'number') this.siteStats.registeredChannels = value;
    });
  }

  private extractCount(payload: any, keys: string[]): number | null {
    if (typeof payload === 'number') return payload;
    if (payload && typeof payload === 'object') {
      for (const k of keys) {
        if (typeof payload[k] === 'number') return payload[k];
      }
    }
    return null;
  }

  private handleReferral(): void {
    this.refferal = (this.router.url).split('/')[1] ?? null;
  }

  loginWithTwitch() {
    //? Check if this device already has a token
    if(this.userService.restoreUser()) {
      console.log('user restored');
      this.router.navigate(['/login']);
    } else {
      window.location.href = this.twitchAuthUrl;
    }
  }

  openDiscord() {
    window.open(environment.DISCORD_URL, '_blank');
  }
}
