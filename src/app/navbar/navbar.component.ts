import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService } from '../user.service';
import { LucideAngularModule, Twitch, Settings, LayoutDashboard, Terminal, User, LogOut, CircuitBoard } from 'lucide-angular';
import { AuthService } from '../auth.service';
import { LinksService } from '../links.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  user = this.userService.getUser();
  isDropdownOpen = false;

  // Icons
  twitchIcon = Twitch;
  dashboardIcon = LayoutDashboard;
  commandsIcon = Terminal;
  settingsIcon = Settings;
  userIcon = User;
  logoutIcon = LogOut;
  circuitBoardIcon = CircuitBoard;

  authUrl = '';

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private linksService: LinksService
  ) {
    this.user = this.userService.getUser();
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
  }
  
  startPermissionFlow() {
    window.location.href = this.authUrl;
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }
}
