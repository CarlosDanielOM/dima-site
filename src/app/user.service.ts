import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { Router } from '@angular/router';
import { User } from './user';
import { map } from 'rxjs';
import { UserEventsService } from './services/user-events.service';

@Injectable({
  providedIn: 'root'
})

export class UserService {

  private user: User = null!;

  private routeUser: User = null!;

  constructor(
    private http: HttpClient,
    private router: Router,
    private userEventsService: UserEventsService
  ) { }

  createUser(user: User): boolean {
    this.user = user;
    sessionStorage.setItem('user', JSON.stringify(user));
    this.userEventsService.notifyUserStatusChanged();
    return true;
  }

  createRouteUser(user: User): boolean {
    this.routeUser = user;
    sessionStorage.setItem('routeUser', JSON.stringify(user));
    return true;
  }

  restoreUser(): boolean {
    const userData = sessionStorage.getItem('user');
    
    if (!userData) {
      this.deleteData();
      return false;
    }

    try {
      this.user = JSON.parse(userData);
      
      if (!this.user || !this.user.token) {
        this.deleteData();
        return false;
      }
      
      // Notify other services that user was restored
      this.userEventsService.notifyUserStatusChanged();
      
      return true;
    } catch (error) {
      console.error('Error parsing user data:', error);
      this.deleteData();
      return false;
    }
  }

  restoreRouteUser(): boolean {
    const routeUserData = sessionStorage.getItem('routeUser');
    
    if (!routeUserData) {
      // If no route user data, try to fetch it
      if (this.user && this.user.token) {
        this.http.get<User>(`${environment.DIMA_API}/user`, {
          params: {
            username: this.router.url.split('/')[1]
          }
        }).subscribe(res => {
          let data = res;
          let dataUser: User = {
            login: data.login,
            display_name: data.display_name,
            actived: this.user.actived,
            email: this.user.email,
            id: data.id,
            profile_image_url: data.profile_image_url,
            premium: this.user.premium,
            premium_until: this.user.premium_until,
            premium_plus: this.user.premium_plus,
            chat_enabled: this.user.chat_enabled,
            token: this.user.token,
            up_to_date_twitch_permissions: this.user.up_to_date_twitch_permissions
          };
          this.createRouteUser(dataUser);
          this.routeUser = dataUser;
        });
      }
      return true;
    }

    try {
      this.routeUser = JSON.parse(routeUserData);
      
      if (!this.routeUser || !this.routeUser.token) {
        // If route user is invalid, clear it but don't fail
        this.routeUser = null!;
        sessionStorage.removeItem('routeUser');
      }
      
      return true;
    } catch (error) {
      console.error('Error parsing route user data:', error);
      this.routeUser = null!;
      sessionStorage.removeItem('routeUser');
      return true;
    }
  }

  deleteData(): void {
    this.user = null!;
    this.routeUser = null!;

    sessionStorage.removeItem('user');
    sessionStorage.removeItem('routeUser');
  }

  getUser(): User | null {
    return this.user;
  }

  getLogin(): string {
    return this.user?.login || '';
  }

  getDisplayName(): string {
    return this.user?.display_name || '';
  }

  getEmail(): string {
    return this.user?.email || '';
  }

  getUserId(): number {
    return this.user?.id || 0;
  }

  getProfileImageUrl(): string {
    return this.user?.profile_image_url || '';
  }

  getPremium(): boolean {
    return this.user?.premium || false;
  }

  getPremiumUntil(): string {
    return this.user?.premium_until || '';
  }

  getPremiumPlus(): boolean {
    return this.user?.premium_plus || false;
  }

  getPremiumStatus(): string {
    if (!this.user) return 'none';
    
    if (this.user.premium_plus) {
      return 'premium_plus';
    } else if (this.user.premium) {
      return 'premium';
    } else {
      return 'none';
    }
  }

  getToken(): string {
    return this.user?.token || '';
  }

  getActive(): boolean {
    return this.user?.actived || false;
  }

  isChatEnabled(): boolean {
    return this.user?.chat_enabled || false;
  }

  isUpToDate(): boolean {
    return this.user?.up_to_date_twitch_permissions || false;
  }

  setChatEnabled(status: boolean): void {
    if (!this.user) return;
    
    this.http.post(`${environment.DIMA_API}/user/chat/${this.user.id}`, {
      enabled: status
    }).subscribe(res => {
      this.user.chat_enabled = status;
      sessionStorage.setItem('user', JSON.stringify(this.user));
    })
  }
  
  changeActiveStatus(status: boolean): void {
    if (!this.user) return;
    
    this.user.actived = status;
    sessionStorage.setItem('user', JSON.stringify(this.user));
    this.userEventsService.notifyUserStatusChanged();
  }

  loginUser() {

  }

  logoutUser() {
    this.deleteData();
    this.router.navigate(['/']);
  }
  
}