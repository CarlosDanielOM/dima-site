import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { LinksService } from '../links.service';
import { UserService } from '../user.service';
import { LucideAngularModule } from 'lucide-angular';
import { 
  Twitch,
  Activity,
  Tv,
  Users,
  MessageCircle,
  Zap,
  Settings,
  Check,
} from 'lucide-angular';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [LucideAngularModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css'
})

export class LandingPageComponent {

  refferal: string = '';
  twitchAuthUrl: string = '';
  twitchIcon = Twitch;
  activityIcon = Activity;
  tvIcon = Tv;
  usersIcon = Users;
  messageCircleIcon = MessageCircle;
  zapIcon = Zap;
  settingsIcon = Settings;
  checkIcon = Check;

  constructor(
    private router: Router,
    private linksService: LinksService,
    private userService: UserService
  ) {
    let scope = encodeURIComponent('user:read:email');
    this.twitchAuthUrl = `${this.linksService.getTwitchAuthUrl()}&scope=${scope}`;
  }

  ngOnInit(): void {
    this.refferal = (this.router.url).split('/')[1] ?? null;
    if(this.refferal) {
      if(this.refferal == 'dev') {
        let userData = {
          login: 'cdom201',
          display_name: 'CDOM201',
          actived: true,
          email: 'carlos@carlosdaniel.info',
          id: 533538623,
          profile_image_url: 'https://static-cdn.jtvnw.net/jtv_user_pictures/0936ac6e-acf4-4a99-8b4d-a56012cb1859-profile_image-300x300.png',
          premium: true,
          premium_until: '',
          premium_plus: true,
          chat_enabled: true,
          token: 'asdas65d4asdas654'
        }
        this.userService.createUser(userData);
        this.userService.createRouteUser(userData);
        this.router.navigate(['/cdom201/dashboard']);
      }
    }
  }
  
  loginWithTwitch() {
    //? Check if this device already has a token
    if(this.userService.restoreUser()) {
      console.log('user restored');
      this.router.navigate(['/login']);
    } else {
      window.location.href = this.twitchAuthUrl;
    }
  }

  openDiscord() {
    window.open(environment.DISCORD_URL, '_blank');
  }
  
}
