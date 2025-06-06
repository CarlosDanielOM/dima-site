import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, LayoutDashboard, Terminal, BarChart3, Users, Settings, Menu, Crown, Construction, Lock } from 'lucide-angular';
import { UserService } from '../user.service';

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
  imports: [CommonModule, RouterModule, LucideAngularModule],
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
    private userService: UserService
  ) {}
  
  links: NavLink[] = [
    { href: `dashboard`, label: 'Dashboard', icon: this.dashboardIcon, premium: false, premium_plus: false, disabled: false, },
    { href: `commands`, label: 'Commands', icon: this.commandsIcon, premium: false, premium_plus: false, disabled: true },
    { href: `analytics`, label: 'Analytics', icon: this.analyticsIcon, premium: false, premium_plus: false, disabled: true },
    { href: `users`, label: 'Users', icon: this.usersIcon, premium: false, premium_plus: false, disabled: true },
    { href: `settings`, label: 'Settings', icon: this.settingsIcon, premium: false, premium_plus: false, disabled: true },
  ];

  toggleSidebar() {
    this.isOpen = !this.isOpen;
  }
}
