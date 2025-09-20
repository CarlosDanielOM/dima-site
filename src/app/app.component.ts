import { Component } from '@angular/core';
import { Event, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import posthog from 'posthog-js';
import { filter, Observable } from 'rxjs';
import { ToastComponent } from './toast/toast.component';
import { ConfirmationModalComponent } from './shared/confirmation-modal/confirmation-modal.component';
import { ThemesService } from './services/themes.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent, CommonModule, ConfirmationModalComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'dima-site';

  navigationEnd: Observable<NavigationEnd>;

  constructor(
    public router: Router,
    public themeService: ThemesService
  ) {
    this.navigationEnd = router.events.pipe(
      filter((event: Event) => event instanceof NavigationEnd)
    ) as Observable<NavigationEnd>;
  }

  ngOnInit() {
    if (location.hostname === "localhost" || location.hostname === "127.0.0.1" || location.hostname === "dima.local") { 
      posthog.opt_out_capturing(); 
    }
    
    this.navigationEnd.subscribe((event: NavigationEnd) => {
      posthog.capture('$pageview');
    })
  }
  
}
