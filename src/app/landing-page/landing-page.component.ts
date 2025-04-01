import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LinksService } from '../links.service';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css'
})

export class LandingPageComponent {

  refferal: string = '';
  twitchAuthUrl: string = '';
  
  constructor(
    private router: Router,
    private linksService: LinksService
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
    window.location.href = this.twitchAuthUrl;
  }
  
}
