import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../user.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
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
    }

    if(this.token) {
      this.authService.checkIfUserExists(this.token);
    } else {
      this.token = this.location.normalize(this.location.path()).split('&')[0].split('=')[1] || '';

      if(!this.token) {
        //! User Denied Access
        this.router.navigate(['/']);
      }

      this.authService.loginWithToken(this.token);
    }


  }
  
}
