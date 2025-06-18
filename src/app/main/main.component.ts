import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { UserService } from '../user.service';
import { DashboardComponent } from '../streamer-wrapper/dashboard/dashboard.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { SideNavbarComponent } from '../side-navbar/side-navbar.component';
@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule, RouterModule, DashboardComponent, NavbarComponent, SideNavbarComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
export class MainComponent {
  constructor(
    private userService: UserService,
    private router: Router
  ) {
    if (!this.userService.restoreUser()) {
      this.router.navigate(['/login']);
    }
  }
}
