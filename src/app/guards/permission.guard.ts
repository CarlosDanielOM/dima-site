import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { UserService } from '../user.service';

export interface PermissionConfig {
  requiredLevel: 'everyone' | 'premium' | 'premium_plus' | 'none';
  redirectTo?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PermissionGuard implements CanActivate {

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const permissionConfig: PermissionConfig = route.data['permission'] || { requiredLevel: 'everyone' };
    
    // First, try to restore user from session storage
    if (!this.userService.restoreUser()) {
      this.router.navigate(['/login']);
      return false;
    }

    // Check if user is logged in
    const user = this.userService.getUser();
    if (!user || !user.token) {
      this.router.navigate(['/login']);
      return false;
    }

    // Check permission level
    const userPremiumStatus = this.userService.getPremiumStatus();
    const hasPermission = this.checkPermission(userPremiumStatus, permissionConfig.requiredLevel);

    if (!hasPermission) {
      // Only redirect if explicitly configured and not already on the target route
      if (permissionConfig.redirectTo) {
        const currentStreamer = this.getCurrentStreamer(state.url);
        const targetRoute = `/${currentStreamer}/${permissionConfig.redirectTo}`;
        
        // Don't redirect if we're already on the target route or if it's a refresh
        if (!state.url.includes(permissionConfig.redirectTo)) {
          this.router.navigate([targetRoute]);
          return false;
        }
      }
      return false;
    }

    return true;
  }

  private checkPermission(userStatus: string, requiredLevel: string): boolean {
    switch (requiredLevel) {
      case 'everyone':
        return true;
      case 'premium':
        return userStatus === 'premium' || userStatus === 'premium_plus';
      case 'premium_plus':
        return userStatus === 'premium_plus';
      case 'none':
        return false;
      default:
        return true;
    }
  }

  private getCurrentStreamer(url: string): string {
    const segments = url.split('/');
    return segments[1] || '';
  }
}
