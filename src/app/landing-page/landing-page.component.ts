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
  Check
} from 'lucide-angular';

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
      console.log('refferal');
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
  
}
