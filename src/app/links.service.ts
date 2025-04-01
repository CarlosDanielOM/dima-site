import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LinksService {

  twitchAuthUrl: string;
  
  constructor() {
    this.twitchAuthUrl = `https://id.twitch.tv/oauth2/authorize?response_type=token&force_verify=false&client_id=jl9k3mi67pmrbl1bh67y07ezjdc4cf&redirect_uri=${this.getLink()}/login&response_type=token`;
  }

  getTwitchAuthUrl() {
    return this.twitchAuthUrl;
  }

  getLink() {
    return environment.production ? 'https://domdimabot.com' : 'http://localhost:4200';
  }
  
}
