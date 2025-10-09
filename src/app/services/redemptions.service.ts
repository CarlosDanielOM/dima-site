import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserService } from './../user.service';
import { environment } from '../../environments/environment';
import { catchError, map, tap } from 'rxjs/operators';
import { Redemptions } from '../interfaces/redemptions';
import { CacheService } from './cache.service';
import { throwError } from 'rxjs';
import { ToastService } from '../toast.service';

@Injectable({
  providedIn: 'root'
})
export class RedemptionsService {

  private headers: HttpHeaders | null = null;
  private readonly REDEMPTIONS_TTL_MS = 300_000; // 5 minutes
  
  constructor(
    private http: HttpClient,
    private userService: UserService,
    private cache: CacheService,
    private toastService: ToastService
  ) { 
    this.headers = new HttpHeaders().set('Authorization', `${this.userService.getToken()}`);
  }

  createRedemption(redemption: Redemptions) {
    return this.http.post(`${environment.DIMA_API}/rewards/${this.userService.getUserId()}`, redemption, { headers: this.headers as any }).pipe(
      map((res: any) => {
        this.toastService.success('Redemption Created', 'The redemption has been created.');
        this.invalidateRedemptionsCache();
        return res.redemption;
      }),
      catchError((err: any) => {
        this.toastService.error('Error', err.error.message);
        return throwError(() => err);
      })
    )
  }

  getRedemptions(forceRefresh = false) {
    const userId = this.userService.getUserId();
    const cacheKey = `redemptions:${userId}`;
    return this.cache.getOrSet<Redemptions[]>(
      cacheKey,
      this.REDEMPTIONS_TTL_MS,
      () => this.http
        .get(`${environment.DIMA_API}/rewards/${userId}`, { headers: this.headers as any })
        .pipe(map((res: any) => res.data as Redemptions[])),
      forceRefresh
    );
  }

  updateRedemptionField(redemptionID: string, field: string, value: any) {
    return this.http.patch(
      `${environment.DIMA_API}/rewards/${this.userService.getUserId()}/${redemptionID}`,
      { [field]: value },
      { headers: this.headers as any }
    ).pipe(tap(() => this.invalidateRedemptionsCache()));
  }

  updateRedemption(redemptionID: string, redemption: Partial<Redemptions>) {
    console.log('updateRedemption', redemptionID, redemption);
    return this.http.patch(
      `${environment.DIMA_API}/rewards/${this.userService.getUserId()}/${redemptionID}`,
      redemption,
      { headers: this.headers as any }
    ).pipe(tap(() => this.invalidateRedemptionsCache()));
  }
  

  invalidateRedemptionsCache(): void {
    const userId = this.userService.getUserId();
    const cacheKey = `redemptions:${userId}`;
    this.cache.clear(cacheKey);
  }

  getTwitchRedemptions(forceRefresh = false) {
    const userId = this.userService.getUserId();
    const cacheKey = `twitch-redemptions:${userId}`;
    return this.cache.getOrSet<any[]>(
      cacheKey,
      this.REDEMPTIONS_TTL_MS,
      () => this.http
        .get(`${environment.DIMA_API}/rewards/twitch/${userId}`, { headers: this.headers as any })
        .pipe(map((res: any) => res.data)),
      forceRefresh
    );
  }

  deleteRedemption(redemptionID: string) {
    return this.http.delete(`${environment.DIMA_API}/rewards/${this.userService.getUserId()}/${redemptionID}`, { headers: this.headers as any })
    .pipe(
      tap(() => {
        this.invalidateRedemptionsCache();
      }),
      catchError((error) => {
        this.toastService.error('Error', error.error.message);
        return throwError(() => error);
      })
    );
  }
}
