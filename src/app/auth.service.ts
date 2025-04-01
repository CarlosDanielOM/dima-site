import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private http: HttpClient
  ) { }

  checkIfUserExists(token: string) {
    this.checkIfTokenIsValid(token).subscribe((isValid) => {
      if (isValid) {
        console.log('Token is valid');
      } else {
        console.log('Token is invalid');
      }
    });
  }

  loginWithToken(token: string) {}

  checkIfTokenIsValid(token: string) {
    return this.http.get('https://id.twitch.tv/oauth2/validate', {
      headers: {
        'Authorization': `OAuth ${token}`
      }
    }).pipe(
      map(response => {
        console.log('Token validation response:', response);
        return true;
      }),
      catchError(error => {
        console.error('Token validation error:', error);
        return of(false);
      })
    );
  }
}
