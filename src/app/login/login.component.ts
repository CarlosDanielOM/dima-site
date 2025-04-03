import { HashLocationStrategy, Location, LocationStrategy } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../user.service';
import { AuthService } from '../auth.service';
import { User } from '../user';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  providers: [Location, { provide: LocationStrategy, useClass: HashLocationStrategy }]
})
export class LoginComponent {
  token: string = '';
  userData: any = {};

  constructor(
    private router: Router,
    private location: Location,
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    if(this.userService.restoreUser()) {
      this.token = this.userService.getToken();
      console.log("User already logged in");
    }

    if(!this.token) {
      this.token = this.location.normalize(this.location.path()).split('&')[0].split('=')[1] || '';

      if(!this.token) {
        //! User Denied Access
        this.router.navigate(['/']);
      }
      console.log("Token found");
    }

    this.authService.checkIfTokenIsValid(this.token).subscribe(data => {
      if(!data.valid) {
        this.userService.deleteData();
        this.router.navigate(['/']);
      }

      this.authService.getUserInfoByToken(this.token).subscribe(data => {
        let userInfo = data.data.data[0];
        this.authService.loginWithToken(this.token, userInfo.login, userInfo.email, userInfo.id).subscribe((response: any) => {
          let user = response.data;
          let userData: User = {
            id: userInfo.id,
            login: userInfo.login,
            display_name: userInfo.display_name,
            token: this.token,
            email: userInfo.email,
            profile_image_url: userInfo.profile_image_url,
            premium: user.premium,
            premium_until: user.premium_until,
            premium_plus: user.premium_plus,
            actived: user.actived,
            chat_enabled: user.chat_enabled
          }
          let userCreated = this.userService.createUser(userData);
          if(userCreated) {
            this.router.navigate(['/' + userData.login + '/dashboard']);
          } else {
            this.router.navigate(['/']);
          }
        })
      })
      
    });
    
  }
}
