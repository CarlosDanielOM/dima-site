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

  createUser(user: User): void {
    this.user = user;
    sessionStorage.setItem('user', JSON.stringify(user));
  }

  createRouteUser(user: User): void {
    this.routeUser = user;
    sessionStorage.setItem('routeUser', JSON.stringify(user));
  }

  restoreUser(): boolean {
    this.user = JSON.parse(sessionStorage.getItem('user')??'');

    if(!this.user) {
      this.deleteData();
      return false;
    }
    
    this.user = this.user;
    return true;
  }

  restoreRouteUser(): boolean {
    this.routeUser = JSON.parse(sessionStorage.getItem('routeUser')??'');

    if(!this.user) {
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
          username: data.username,
          display_name: data.display_name,
          active: this.user.active,
          email: this.user.email,
          id: data.id,
          profile_image_url: data.profile_image_url,
          role: this.user.role,
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

  getUsername(): string {
    return this.user.username;
  }

  getDisplayName(): string {
    return this.user.display_name;
  }

  getEmail(): string {
    return this.user.email;
  }

  getProfileImageUrl(): string {
    return this.user.profile_image_url;
  }

  getRole(): string {
    return this.user.role;
  }

  getToken(): string {
    return this.user.token;
  }

  getActive(): boolean {
    return this.user.active;
  }

  changeActiveStatus(status: boolean): void {
    this.user.active = status;
    sessionStorage.setItem('user', JSON.stringify(this.user));
  }

  loginUser() {

  }

  logoutUser() {
    this.deleteData();
    this.router.navigate(['/']);
  }

  getEvents() {
    return this.http.get<any>(`${environment.DIMA_API}/dev/eventsubs`).pipe(
      map(res => res.events)
    );
  }
  
}
