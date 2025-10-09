import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { UserService } from '../user.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { SideNavbarComponent } from '../side-navbar/side-navbar.component';
@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, SideNavbarComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
export class MainComponent {
  constructor(
    private userService: UserService,
    private router: Router
  ) {
    // User restoration is now handled by the PermissionGuard
    // This component just ensures the user is available for the template
  }
}
