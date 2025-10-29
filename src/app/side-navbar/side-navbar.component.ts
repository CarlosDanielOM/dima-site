import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, LayoutDashboard, Terminal, BarChart3, Users, Settings, Menu, Crown, Construction, Lock } from 'lucide-angular';
import { TranslateModule } from '@ngx-translate/core';
import { UserService } from '../user.service';
import { SidebarService } from '../services/sidebar.service';

interface NavLink {
  href: string;
  label: string;
  icon: any;
  premium: boolean;
  premium_plus: boolean;
  disabled: boolean;
}

@Component({
  selector: 'app-side-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, TranslateModule],
  templateUrl: './side-navbar.component.html',
  styleUrls: ['./side-navbar.component.css']
})
export class SideNavbarComponent {
  isOpen = false;
  
  // Icons
  menuIcon = Menu;
  dashboardIcon = LayoutDashboard;
  commandsIcon = Terminal;
  analyticsIcon = BarChart3;
  usersIcon = Users;
  settingsIcon = Settings;
  crownIcon = Crown;
  constructionIcon = Construction;
  lockIcon = Lock;

  constructor(
    private userService: UserService,
    private sidebarService: SidebarService
  ) {
    this.sidebarService.isOpen$.subscribe(isOpen => {
      this.isOpen = isOpen;
    });
  }
  
  links: NavLink[] = [
    { href: `dashboard`, label: 'sidebar.dashboard', icon: this.dashboardIcon, premium: false, premium_plus: false, disabled: false, },
    { href: `commands`, label: 'sidebar.commands', icon: this.commandsIcon, premium: false, premium_plus: false, disabled: false },
    { href: `analytics`, label: 'sidebar.analytics', icon: this.analyticsIcon, premium: false, premium_plus: false, disabled: true },
    { href: `users`, label: 'sidebar.users', icon: this.usersIcon, premium: false, premium_plus: false, disabled: true },
    { href: `settings`, label: 'sidebar.settings', icon: this.settingsIcon, premium: false, premium_plus: false, disabled: true },
  ];

  toggleSidebar() {
    this.sidebarService.toggle();
  }
}
