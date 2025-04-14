import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { Router } from '@angular/router';
import { User } from './user';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class UserService {

  private user: User = null!;

  private routeUser: User = null!;

  constructor(
    private http: HttpClient,
    private router: Router,
  ) { }

  createUser(user: User): boolean {
    this.user = user;
    sessionStorage.setItem('user', JSON.stringify(user));
    return true;
  }

  createRouteUser(user: User): boolean {
    this.routeUser = user;
    sessionStorage.setItem('routeUser', JSON.stringify(user));
    return true;
  }

  restoreUser(): boolean {
    this.user = JSON.parse(sessionStorage.getItem('user') ?? '{}');

    if(!this.user.token) {
      this.deleteData();
      return false;
    }
    
    this.user = this.user;
    return true;
  }

  restoreRouteUser(): boolean {
    this.routeUser = JSON.parse(sessionStorage.getItem('routeUser') ?? '{}');

    if(!this.user.token) {
      this.deleteData();
      return false;
    }
    
    if(!this.routeUser) {
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
          token: this.user.token
        };
        this.createRouteUser(dataUser);
        this.routeUser = dataUser;
      })
    }
    return true;
  }

  deleteData(): void {
    this.user = null!;
    this.routeUser = null!;

    sessionStorage.removeItem('user');
    sessionStorage.removeItem('routeUser');
  }

  getUser(): User {
    return this.user;
  }

  getLogin(): string {
    return this.user.login;
  }

  getDisplayName(): string {
    return this.user.display_name;
  }

  getEmail(): string {
    return this.user.email;
  }

  getUserId(): number {
    return this.user.id;
  }

  getProfileImageUrl(): string {
    return this.user.profile_image_url;
  }

  getPremium(): boolean {
    return this.user.premium;
  }

  getPremiumUntil(): string {
    return this.user.premium_until;
  }

  getPremiumPlus(): boolean {
    return this.user.premium_plus;
  }

  getToken(): string {
    return this.user.token;
  }

  getActive(): boolean {
    return this.user.actived;
  }

  isChatEnabled(): boolean {
    return this.user.chat_enabled;
  }

  setChatEnabled(status: boolean): void {
    this.http.post(`${environment.DIMA_API}/user/chat/${this.user.id}`, {
      enabled: status
    }).subscribe(res => {
      this.user.chat_enabled = status;
      sessionStorage.setItem('user', JSON.stringify(this.user));
    })
  }
  
  changeActiveStatus(status: boolean): void {
    this.user.actived = status;
    sessionStorage.setItem('user', JSON.stringify(this.user));
  }

  loginUser() {

  }

  logoutUser() {
    this.deleteData();
    this.router.navigate(['/']);
  }
  
}
