import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, LayoutDashboard, Terminal, BarChart3, Users, Settings, Menu } from 'lucide-angular';

interface NavLink {
  href: string;
  label: string;
  icon: any;
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
  
  links: NavLink[] = [
    { href: '/dashboard', label: 'Dashboard', icon: this.dashboardIcon },
    { href: '/commands', label: 'Commands', icon: this.commandsIcon },
    { href: '/analytics', label: 'Analytics', icon: this.analyticsIcon },
    { href: '/users', label: 'Users', icon: this.usersIcon },
    { href: '/settings', label: 'Settings', icon: this.settingsIcon },
  ];

  toggleSidebar() {
    this.isOpen = !this.isOpen;
  }
}
