import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { finalize, tap, shareReplay } from 'rxjs/operators';

interface CacheEntry<T> {
  value: T;
  expiration: number;
}

@Injectable({ providedIn: 'root' })
export class CacheService {
  private cache = new Map<string, CacheEntry<unknown>>();
  private inFlight = new Map<string, Observable<unknown>>();
  private readonly CACHE_PREFIX = 'cache:';
  private readonly COOLDOWN_PREFIX = 'cooldown:';
  private readonly COOLDOWN_DURATION_MS = 20 * 1000; // 20 seconds

  private readCacheEntry<T>(key: string): CacheEntry<T> | null {
    try {
      const raw = localStorage.getItem(this.CACHE_PREFIX + key);
      if (!raw) return null;
      return JSON.parse(raw) as CacheEntry<T>;
    } catch {
      return null;
    }
  }

  private writeCacheEntry<T>(key: string, entry: CacheEntry<T>): void {
    try {
      localStorage.setItem(this.CACHE_PREFIX + key, JSON.stringify(entry));
    } catch {
      // ignore storage errors
    }
  }

  private removeCacheEntry(key: string): void {
    try {
      localStorage.removeItem(this.CACHE_PREFIX + key);
    } catch {
      // ignore
    }
  }

  private getCooldownTimestamp(key: string): number {
    try {
      const ts = localStorage.getItem(this.COOLDOWN_PREFIX + key);
      return ts ? parseInt(ts, 10) : 0;
    } catch {
      return 0;
    }
  }

  private updateCooldownTimestamp(key: string): void {
    try {
      localStorage.setItem(this.COOLDOWN_PREFIX + key, Date.now().toString());
    } catch {
      // ignore
    }
  }

  private removeCooldown(key: string): void {
    try {
      localStorage.removeItem(this.COOLDOWN_PREFIX + key);
    } catch {
      // ignore
    }
  }

  private isCooldownActive(key: string): boolean {
    const last = this.getCooldownTimestamp(key);
    return Date.now() - last < this.COOLDOWN_DURATION_MS;
  }

  get<T>(key: string): T | null {
    const memEntry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (memEntry) {
      if (Date.now() <= memEntry.expiration) {
        return memEntry.value as T;
      }
      // drop expired from memory, but keep in storage for potential stale serve
      this.cache.delete(key);
    }

    const stored = this.readCacheEntry<T>(key);
    if (!stored) return null;
    if (Date.now() <= stored.expiration) {
      this.cache.set(key, stored as unknown as CacheEntry<unknown>);
      return stored.value;
    }
    return null;
  }

  private getStale<T>(key: string): T | null {
    const memEntry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (memEntry) return memEntry.value;
    const stored = this.readCacheEntry<T>(key);
    return stored ? stored.value : null;
  }

  set<T>(key: string, value: T, ttlMs: number): void {
    const entry: CacheEntry<T> = { value, expiration: Date.now() + ttlMs };
    this.cache.set(key, entry as unknown as CacheEntry<unknown>);
    this.writeCacheEntry<T>(key, entry);
  }

  clear(key?: string): void {
    if (key) {
      this.cache.delete(key);
      this.inFlight.delete(key);
      this.removeCacheEntry(key);
      this.removeCooldown(key);
    } else {
      this.cache.clear();
      this.inFlight.clear();
      // remove only our keys from localStorage
      try {
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const k = localStorage.key(i) as string;
          if (k && (k.startsWith(this.CACHE_PREFIX) || k.startsWith(this.COOLDOWN_PREFIX))) {
            localStorage.removeItem(k);
          }
        }
      } catch {
        // ignore
      }
    }
  }

  getOrSet<T>(key: string, ttlMs: number, fetcher: () => Observable<T>, forceRefresh = false): Observable<T> {
    if (!forceRefresh) {
      const cached = this.get<T>(key);
      if (cached !== null) {
        return of(cached);
      }
    }

    const existingInFlight = this.inFlight.get(key) as Observable<T> | undefined;
    if (existingInFlight) {
      return existingInFlight;
    }

    if (this.isCooldownActive(key)) {
      const stale = this.getStale<T>(key);
      if (stale !== null) {
        return of(stale);
      }
      // no cache at all, allow API request
    }

    const request$ = fetcher().pipe(
      tap((value) => {
        this.set<T>(key, value, ttlMs);
        this.updateCooldownTimestamp(key);
      }),
      finalize(() => this.inFlight.delete(key)),
      shareReplay(1)
    );

    this.inFlight.set(key, request$ as unknown as Observable<unknown>);
    return request$;
  }
}


