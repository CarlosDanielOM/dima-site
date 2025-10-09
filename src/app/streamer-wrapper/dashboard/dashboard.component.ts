import { Component, signal, computed, afterNextRender } from '@angular/core';
import { UserService } from '../../user.service';
import { CommonModule } from '@angular/common';
import { LinksService } from '../../links.service';
import { AuthService } from '../../auth.service';
import { LucideAngularModule, Activity, Calendar, BarChart2, ChevronDown, Users, TrendingUp, Clock, DollarSign, Heart, Star } from 'lucide-angular';
import { BlockInactiveUserDirective } from '../../directives/block-inactive-user.directive';
import posthog from 'posthog-js';

type StreamStat = {
  date: string;         // ISO date or friendly label
  viewers: number;      // peak or avg per stream
  hours: number;        // stream duration in hours
  donations: number;    // income for that stream
  follows: number;      // new follows that stream
  subs: number;         // new subs that stream
};
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, BlockInactiveUserDirective],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})

export class DashboardComponent {

  Activity = Activity;
  Calendar = Calendar;
  BarChart2 = BarChart2;
  ChevronDown = ChevronDown;
  Users = Users;
  TrendingUp = TrendingUp;
  Clock = Clock;
  DollarSign = DollarSign;
  Heart = Heart;
  Star = Star;
  
  authUrl = '';
  scopes: any = [];
  chat_enabled = false;
  active = false;
  
  constructor(
    private userService: UserService,
    private linksService: LinksService,
    private authService: AuthService
  ) {
    afterNextRender(() => {
      console.log(this.userService.getUserId());
    });
  }

  ngOnInit() {
    let s = this.authService.getScopes();

    let scopeString = '';
    
    s.forEach((scope, index, scopes) => {
      if (index === scopes.length - 1) {  
        scopeString += encodeURIComponent(scope);
      } else {
        scopeString += encodeURIComponent(scope) + '+';
      }
    })

    this.authUrl = `https://id.twitch.tv/oauth2/authorize?response_type=code&force_verify=false&client_id=jl9k3mi67pmrbl1bh67y07ezjdc4cf&redirect_uri=${this.linksService.getApiURL()}/auth/register&scope=${scopeString}&state=${this.userService.getLogin()}`

    this.active = this.userService.getActive();
    this.chat_enabled = this.userService.isChatEnabled();

    posthog.identify(this.userService.getUserId() as unknown as string, {
      email: this.userService.getEmail(),
      name: this.userService.getDisplayName(),
      username: this.userService.getLogin(),
    });

    posthog.capture('dashboard_viewed');
  }
  
  toggleChatEnabled() {
    this.userService.setChatEnabled(!this.chat_enabled);
    this.chat_enabled = !this.chat_enabled;
  }
  
  startPermissionFlow() {
    window.location.href = this.authUrl;
  }
  
  // Mock signals (replace with service-observables, store, or inputs)
  channelName = signal(`${this.userService.getDisplayName()}`);

  streamHistory = signal<StreamStat[]>([
    { date: '2024-09-01', viewers: 850, hours: 4.5, donations: 125.50, follows: 32, subs: 15 },
    { date: '2024-09-05', viewers: 920, hours: 5.2, donations: 210.00, follows: 41, subs: 18 },
    { date: '2024-09-10', viewers: 780, hours: 3.9, donations: 75.00, follows: 22, subs: 9 },
    { date: '2024-09-15', viewers: 1100, hours: 6.1, donations: 325.25, follows: 55, subs: 26 },
    { date: '2024-09-20', viewers: 990, hours: 4.7, donations: 140.00, follows: 38, subs: 17 },
  ]);

  // Active totals (replace with real-time data)
  activeViewers = signal(920); // live or last stream
  activeFollows = signal(4210);
  activeSubs = signal(935);
  monthlyGoalSubs = signal(1000);

  // Computed KPIs
  totalStreams = computed(() => this.streamHistory().length);

  averageViewers = computed(() => {
    const hist = this.streamHistory();
    if (!hist.length) return 0;
    const sum = hist.reduce((a, s) => a + s.viewers, 0);
    return Math.round(sum / hist.length);
  });

  monthlyAverageViewers = computed(() => {
    // Example: average over all records; adapt to filter month
    return this.averageViewers();
  });

  averageHoursPerStream = computed(() => {
    const hist = this.streamHistory();
    if (!hist.length) return 0;
    const sum = hist.reduce((a, s) => a + s.hours, 0);
    return Number((sum / hist.length).toFixed(1));
  });

  totalDonations = computed(() => {
    const hist = this.streamHistory();
    return hist.reduce((a, s) => a + s.donations, 0);
  });

  // Percentage for progress bar
  subsProgressPct = computed(() => {
    const value = Math.min(
      100,
      Math.round((this.activeSubs() / Math.max(this.monthlyGoalSubs(), 1)) * 100)
    );
    return value;
  });

  // Helpers for formatting
  toCurrency(value: number) {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(value);
  }
  toCompact(value: number) {
    return new Intl.NumberFormat(undefined, { notation: 'compact' }).format(value);
  }
  formatDate(date: string) {
    const d = new Date(date);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }
  
}
