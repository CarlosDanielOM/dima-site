import { Component, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService } from '../user.service';
import { LanguageService, SupportedLanguage } from '../services/language.service';
import { LucideAngularModule, Twitch, Settings, LayoutDashboard, Terminal, User, LogOut, CircuitBoard, Menu, Languages } from 'lucide-angular';
import { AuthService } from '../auth.service';
import { LinksService } from '../links.service';
import { SidebarService } from '../services/sidebar.service';

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
  menuIcon = Menu;
  languageIcon = Languages;

  authUrl = '';

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private linksService: LinksService,
    private sidebarService: SidebarService,
    private languageService: LanguageService,
    private elementRef: ElementRef
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

  toggleSidebar() {
    this.sidebarService.toggle();
  }

  closeDropdown() {
    this.isDropdownOpen = false;
  }

  onMenuFocusOut(event: FocusEvent) {
    const currentTarget = event.currentTarget as HTMLElement | null;
    const related = event.relatedTarget as HTMLElement | null;
    if (!currentTarget || !related || !currentTarget.contains(related)) {
      this.closeDropdown();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement | null;
    if (!target) {
      return;
    }
    const clickInside = this.elementRef.nativeElement.contains(target);
    if (!clickInside) {
      this.closeDropdown();
    }
  }

  // Language switching methods
  getCurrentLanguage(): SupportedLanguage {
    return this.languageService.getCurrentLanguage();
  }

  getCurrentLanguageInfo() {
    const currentLang = this.getCurrentLanguage();
    return this.languageService.getLanguageInfo(currentLang);
  }

  getAvailableLanguages() {
    return this.languageService.getAvailableLanguages();
  }

  switchLanguage(language: SupportedLanguage) {
    this.languageService.setLanguage(language);
    this.closeDropdown();
  }

  toggleLanguage() {
    this.languageService.toggleLanguage();
    this.closeDropdown();
  }
}
