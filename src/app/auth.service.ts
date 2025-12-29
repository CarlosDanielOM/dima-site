import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  scopes = [
    "analytics:read:extensions","analytics:read:games","bits:read","channel:manage:ads","channel:read:ads","channel:manage:broadcast","channel:read:charity","channel:edit:commercial","channel:read:editors","channel:manage:extensions","channel:read:goals","channel:read:guest_star","channel:manage:guest_star","channel:read:hype_train","channel:manage:moderators","channel:read:polls","channel:manage:polls","channel:read:predictions","channel:manage:predictions","channel:manage:raids","channel:read:redemptions","channel:manage:redemptions","channel:manage:schedule","channel:read:subscriptions","channel:manage:videos","channel:read:vips","channel:manage:vips","clips:edit","moderation:read","moderator:manage:announcements","moderator:manage:automod","moderator:read:automod_settings","moderator:manage:automod_settings","moderator:manage:banned_users","moderator:read:blocked_terms","moderator:manage:blocked_terms","moderator:read:chat_messages","moderator:manage:chat_messages","moderator:read:chat_settings","moderator:manage:chat_settings","moderator:read:chatters","moderator:read:followers","moderator:read:guest_star","moderator:manage:guest_star","moderator:read:shield_mode","moderator:manage:shield_mode","moderator:read:shoutouts","moderator:manage:shoutouts","user:edit","user:edit:follows","user:read:blocked_users","user:manage:blocked_users","user:read:broadcast","user:manage:chat_color","user:read:email","user:read:follows","user:read:subscriptions","user:manage:whispers","channel:bot","channel:moderate","chat:edit","chat:read","user:bot","user:read:chat","whispers:read","whispers:edit","user:write:chat","channel.manage:clips","moderator:read:suspicious_users","moderator:read:unban_requests","moderator:manage:unban_requests","moderator:read:warnings","moderator:manage:warnings"
  ]

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

  loginWithToken(token: string, name: string, email: string, id: string) {
    return this.http.post(`${environment.DIMA_API}/auth/login`, {
      name: name,
      email: email,
      id: id
    }, {
      headers: {
        'Authorization': `${token}`
      }
    });
  }

  getUserInfoByToken(token: string) {
    return this.http.get(`${environment.TWITCH_API}/users`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Client-ID': environment.CLIENT_ID
      }
    }).pipe(
      map(response => {
        return {
          valid: true,
          data: response
        };
      }),
      catchError(error => {
        return of({
          valid: false,
          data: error
        });
      })
    );
  }

  checkIfTokenIsValid(token: string) {
    return this.http.get('https://id.twitch.tv/oauth2/validate', {
      headers: {
        'Authorization': `OAuth ${token}`
      }
    }).pipe(
      map(response => {
        return {
          valid: true,
          data: response
        };
      }),
      catchError(error => {
          return of({
          valid: false,
          data: error
        });
      })
    );
  }

  getScopes() {
    return this.scopes;
  }
  
}
