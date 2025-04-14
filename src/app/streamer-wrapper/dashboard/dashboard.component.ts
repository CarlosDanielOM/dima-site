import { Component } from '@angular/core';
import { UserService } from '../../user.service';
import { CommonModule } from '@angular/common';
import { LinksService } from '../../links.service';
import { AuthService } from '../../auth.service';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

  authUrl = '';
  scopes: any = [];
  chat_enabled = false;
  active = false;
  
  constructor(
    private userService: UserService,
    private linksService: LinksService,
    private authService: AuthService
  ) {}

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
  }
  
  toggleChatEnabled() {
    this.userService.setChatEnabled(!this.chat_enabled);
    this.chat_enabled = !this.chat_enabled;
  }
  
  startPermissionFlow() {
    window.location.href = this.authUrl;
  }
  
}
