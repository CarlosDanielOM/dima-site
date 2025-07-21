import { Component } from '@angular/core';
import { Event, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import posthog from 'posthog-js';
import { filter, Observable } from 'rxjs';
import { ToastComponent } from './toast/toast.component';
import { ThemesService } from './services/themes.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent, CommonModule],
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
    this.navigationEnd.subscribe((event: NavigationEnd) => {
      posthog.capture('$pageview');
    })
  }
  
}
