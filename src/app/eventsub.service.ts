import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, forkJoin, throwError } from 'rxjs';
import { map, switchMap, tap, shareReplay, catchError } from 'rxjs/operators';
import { ChatEvent, ConfigControl } from './modules/chat-events/chat-events.component'; // Adjust path as needed
import { Gamepad2, Heart, Star, Trophy, UserPlus, Users, VolumeX, Play } from 'lucide-angular';
import { UserService } from './user.service';
import { Router } from '@angular/router';
import { ToastService } from './toast.service';

// Represents the data structure for a user's saved configuration in your MongoDB.
// It's a partial record, only containing what the user has customized.
export interface UserEventConfig {
  name: string; // The primary key, e.g., 'channel.follow', which corresponds to ChatEvent.type
  enabled: boolean;
  subscriptionId?: string; // The subscription ID from the backend
  config?: Partial<ConfigControl>[]; // Only contains the values the user has changed
}

export interface BackendSubscription {
  _id: string; // MongoDB document ID
  id?: string; // Keep for compatibility if needed
  status: string;
  type: string;
  version: string;
  enabled: boolean;
  condition: {
    broadcaster_user_id?: string;
    [key: string]: string | undefined;
  };
  transport: {
    method: string;
    callback: string;
  };
  created_at: string;
  cost: number;
  // It may contain other fields from your DB
  [key: string]: any;
}

export interface Subscription {
  _id: string, // MongoDB document ID
  id?: string, // Keep for compatibility if needed
  status: string,
  type: string,
  version: string,
  condition: {
    broadcaster_user_id?: string,
    moderator_user_id?: string,

  },
  transport: {
    method: string,
    callback: string
  },
  created_at: string,
  cost: number
}

@Injectable({
  providedIn: 'root'
})
export class EventsubService {
  private apiUrl = 'https://api.domdimabot.com';
  private eventsCache$: Observable<ChatEvent[]> | null = null;

  constructor(
    private http: HttpClient,
    private userService: UserService,
    private router: Router,
    private toastService: ToastService
  ) { }

  // This remains the main function your component calls.
  getEvents(): Observable<ChatEvent[]> {
    if (this.eventsCache$) {
      return this.eventsCache$;
    }

    // Try to load from localStorage
    const cached = sessionStorage.getItem('eventsCache');
    if (cached) {
      this.eventsCache$ = of(JSON.parse(cached));
      return this.eventsCache$;
    }

    // Otherwise, fetch from backend and cache
    this.eventsCache$ = this.getBotSupportedEvents().pipe(
      switchMap(allSupportedEvents => 
        forkJoin({
          allSupportedEvents: of(allSupportedEvents),
          userConfigs: this.getUserConfiguredEvents(allSupportedEvents)
        })
      ),
      map(({ allSupportedEvents, userConfigs }) => {
        // This is the new, more powerful merging logic
        return allSupportedEvents.map(defaultEvent => {
          // Find if the user has a saved configuration for this event
          const userConfig = userConfigs.find(c => c.name === defaultEvent.type);

          // If they don't, just return the default template, marked as not subscribed
          if (!userConfig) {
            return { ...defaultEvent, isSubscribed: false };
          }

          // If they do, merge the user's settings into the default template
          const mergedEvent = { ...defaultEvent, isSubscribed: true };
          mergedEvent.enabled = userConfig.enabled ?? false; // Overwrite enabled status
          // Store the subscription ID for later use
          (mergedEvent as any).subscriptionId = userConfig.subscriptionId;

          // If there's a config to merge, do a deep merge on the controls
          if (mergedEvent.config && userConfig.config) {
            mergedEvent.config = mergedEvent.config.map(defaultControl => {
              const userControl = userConfig.config?.find(c => c.id === defaultControl.id);
              // If the user has a saved value for this control, use it (even if empty)
              if (userControl && userControl.value !== undefined) {
                const mergedControl = { ...defaultControl, value: userControl.value };
                // If the user's value is empty, set the default as placeholder
                if (userControl.value === '' && typeof defaultControl.value === 'string' && defaultControl.value) {
                  mergedControl.placeholder = defaultControl.value;
                }
                return mergedControl;
              }
              // Otherwise, keep the default
              return defaultControl;
            });
          }
          
          return mergedEvent;
        });
      }),
      tap(events => {
        sessionStorage.setItem('eventsCache', JSON.stringify(events));
      }),
      shareReplay(1)
    );
    return this.eventsCache$;
  }

  // Method to invalidate the cache
  public clearCache() {
    this.eventsCache$ = null;
    sessionStorage.removeItem('eventsCache');
  }

  // Method to delete an event subscription
  deleteEvent(eventType: string): Observable<any> {
    const channelId = this.userService.getUserId().toString();
    const token = this.userService.getToken();
    const headers = new HttpHeaders().set('Authorization', `${token}`);

    // We need the subscription ID to delete it. Let's get it from the cache.
    return this.getEvents().pipe(
      switchMap(events => {
        const event = events.find(e => e.type === eventType);
        if (!event || !(event as any).subscriptionId) {
          // If there's no event or no subscription ID, we can't delete it.
          // This could mean it was never created, or the cache is out of sync.
          // We can either throw an error or just complete silently.
          // Let's inform the user.
          this.toastService.error('Not Found', 'Could not find a subscription to delete for this event.');
          return throwError(() => new Error('Subscription not found for deletion.'));
        }

        const subscriptionId = (event as any).subscriptionId;
        return this.http.delete(`${this.apiUrl}/eventsubs/${channelId}/${subscriptionId}`, { headers }).pipe(
          tap(() => {
            this.clearCache(); // Invalidate the cache on successful deletion
          })
        );
      })
    );
  }

  // --- Helper Functions ---

  // 1. Fetches the master list of all events your bot can handle from your DB
  private getBotSupportedEvents(): Observable<ChatEvent[]> {
    const token = this.userService.getToken();
    const headers = new HttpHeaders().set('Authorization', `${token}`);
    return this.http.get<{error: boolean, message: string, data: ChatEvent[]}>(`${this.apiUrl}/site/events`, { headers }).pipe(
      map(response => response.data)
    );
  }

  // 2. Fetches the specific configurations for the logged-in user from your DB
  private getUserConfiguredEvents(allSupportedEvents: ChatEvent[]): Observable<UserEventConfig[]> {
    const channelId = this.userService.getUserId().toString();
    const token = this.userService.getToken();
    const headers = new HttpHeaders().set('Authorization', `${token}`);
    return this.http.get<{ data: BackendSubscription[] }>(`${this.apiUrl}/eventsubs/${channelId}`, { headers }).pipe(
      map(response => {
        const subscriptionsArray = response.data || [];

        return subscriptionsArray
          .filter((sub: any) => sub && sub.type) // Filter out any empty/invalid objects
          .map((subscription: BackendSubscription) => {

            const eventDef = allSupportedEvents.find(e => e.type === subscription.type);
            const userConfigControls: Partial<ConfigControl>[] = [];

            if (subscription['message'] !== undefined && eventDef && eventDef.config) {
              // Find the first text control that isn't part of a more complex structure
              const textControl = eventDef.config.find(c => c.type === 'text' && c.id.toLowerCase().includes('message'));
              if (textControl) {
                userConfigControls.push({
                  id: textControl.id,
                  value: subscription['message']
                });
              }
            }
            if(subscription['clipEnabled']) {
              userConfigControls.push({
                id: 'enableClip',
                value: subscription['clipEnabled']
              });
            }
            if(subscription['minViewers']) {
              userConfigControls.push({
                id: 'minViewers',
                value: subscription['minViewers']
              });
            }
            if(subscription['endMessage']) {
              userConfigControls.push({
                id: 'endMessage',
                value: subscription['endMessage']
              });
            }
            if(subscription['endEnabled']) {
              userConfigControls.push({
                id: 'endEnabled',
                value: subscription['endEnabled']
              });
            }
            if (subscription.type === 'channel.cheer' && Array.isArray(subscription['cheerMessages'])) {
              userConfigControls.push({
                id: 'cheerTiers',
                value: subscription['cheerMessages'].map((t: any, i: number) => ({ ...t, id: `tier-${Date.now()}-${i}` }))
              });
            }
            return {
              name: subscription.type,
              enabled: subscription.enabled,
              subscriptionId: subscription._id, // Use MongoDB _id
              config: userConfigControls,
            };
          });
      })
    );
  }

  // Your update/save functions would remain the same
  updateEventStatus(eventType: string, enabled: boolean): Observable<any> {
    const channelId = this.userService.getUserId().toString();
    const token = this.userService.getToken();
    const headers = new HttpHeaders().set('Authorization', `${token}`);

    if (enabled) {
      // First, check if a subscription already exists by looking at our cached events.
      return this.getEvents().pipe(
        switchMap(events => {
          const event = events.find(e => e.type === eventType);
          if (!event) {
            throw new Error(`Event ${eventType} not found in cached events`);
          }

          const subscriptionId = (event as any).subscriptionId;

          if (subscriptionId) {
            // If we have a subscriptionId, it means the event was previously created.
            // We just need to re-enable it with a PATCH request.
            return this.http.patch(`${this.apiUrl}/eventsubs/${channelId}/${subscriptionId}`, { enabled: true }, { headers }).pipe(
              tap(() => {
                // this.clearCache(); // No need to clear cache, local state will be updated
                this.toastService.success('Status Updated', `${eventType} has been ${enabled ? 'enabled' : 'disabled'}.`);
              }),
              catchError((error: any) => {
                const statusCode = error.status || 'Unknown';
                const reason = error.error?.message || error.message || 'Unknown error occurred';
                this.toastService.error(`Error ${statusCode}`, reason);
                throw error;
              })
            );
          } else {
            // If there's no subscriptionId, it's a new event. Create it.
            return this.getBotSupportedEvents().pipe(
              switchMap(botEvents => {
                const eventDef = botEvents.find(e => e.type === eventType);
                if (!eventDef) {
                  throw new Error(`Bot event definition for ${eventType} not found`);
                }

                // Dynamically build the condition based on your new proposed schema.
                const condition: any = {};
                const conditionSchema = eventDef.condition || {};

                for (const key in conditionSchema) {
                  if (Object.prototype.hasOwnProperty.call(conditionSchema, key)) {
                    const idSource = (conditionSchema as any)[key];
                    switch (idSource) {
                      case 'user':
                        condition[key] = channelId;
                        break;
                      case 'moderator':
                        condition[key] = '698614112'; // The bot's user ID
                        break;
                      case 'channel':
                        // This requires user input. We cannot proceed automatically.
                        this.toastService.error(
                          'Configuration Required',
                          `The '${key}' for event '${eventType}' must be configured manually.`
                        );
                        return throwError(() => new Error(`Manual configuration required for ${eventType}.`));
                      default:
                        // If the value is not a keyword, treat it as a literal value.
                        // This is useful for `reward_id` or for backward compatibility.
                        condition[key] = idSource;
                        break;
                    }
                  }
                }

                // Find the default message, corrected to match your schema.
                const body: any = {
                  type: eventDef.type,
                  version: eventDef.version,
                  condition: condition
                };

                if (eventDef.config && Array.isArray(eventDef.config)) {
                  const configPayload: { [key: string]: any } = {};
                  eventDef.config.forEach((control: any) => {
                    if (control.dbId && typeof control.value !== 'undefined') {
                      configPayload[control.dbId] = control.value;
                    }
                  });
                  if (Object.keys(configPayload).length > 0) {
                    body.config = configPayload;
                  }
                }

                return this.http.post(`${this.apiUrl}/eventsubs/${channelId}`, body, { headers }).pipe(
                  tap(() => {
                    console.log({body})
                    this.clearCache(); // Clear cache on CREATE
                    this.toastService.success('Status Updated', `${eventType} has been enabled.`);
                  }),
                  catchError((error: any) => {
                    const statusCode = error.status || 'Unknown';
                    const reason = error.error?.message || error.message || 'Unknown error occurred';
                    this.toastService.error(`Error ${statusCode}`, reason);
                    return throwError(() => error);
                  })
                );
              })
            );
          }
        })
      );
    } else {
        // UNSUBSCRIBE from the event - get subscription ID from cached user configs
        return this.getEvents().pipe(
          switchMap(events => {
            // Find the event in the cached events to get the subscription ID
            const event = events.find(e => e.type === eventType);
            if (!event) {
              throw new Error(`Event ${eventType} not found in cached events`);
            }
            
            // Get the subscription ID from the cached event
            const subscriptionId = (event as any).subscriptionId;
            if (!subscriptionId) {
              // If there's no subscription ID, the event was never enabled on the backend
              return of({ success: true, message: 'Subscription not found, nothing to disable.' });
            }
            
            // Send the PATCH request with the cached subscription ID
            return this.http.patch(`${this.apiUrl}/eventsubs/${channelId}/${subscriptionId}`, { enabled: false }, { headers }).pipe(
              tap(() => {
                // this.clearCache(); // No need to clear cache, local state will be updated
                this.toastService.success('Status Updated', `${eventType} has been ${enabled ? 'enabled' : 'disabled'}.`);
              }),
              catchError((error: any) => {
                const statusCode = error.status || 'Unknown';
                const reason = error.error?.message || error.message || 'Unknown error occurred';
                this.toastService.error(`Error ${statusCode}`, reason);
                throw error;
              })
            );
          })
        );
      }
  }

  getSubscription(type: string): Observable<Subscription | null> {
    const channelId = this.userService.getUserId().toString();
    const token = this.userService.getToken();
    const headers = new HttpHeaders().set('Authorization', `${token}`);

    return this.http.get<Subscription[]>(`${this.apiUrl}/eventsubs/${channelId}?type=${type}`, { headers }).pipe(
      map(subscriptions => subscriptions.length > 0 ? subscriptions[0] : null)
    );
  }
  
  saveEventConfiguration(eventName: string, configToSave: any): Observable<any> {
    const channelId = this.userService.getUserId().toString();
    const token = this.userService.getToken();
    const headers = new HttpHeaders().set('Authorization', `${token}`);

    return this.getEvents().pipe(
      switchMap(events => {
        const event = events.find(e => e.type === eventName);
        if (!event || !(event as any).subscriptionId) {
          this.toastService.error('Not Found', 'Could not find a subscription to update for this event.');
          return throwError(() => new Error('Subscription not found for update.'));
        }

        const subscriptionId = (event as any).subscriptionId;

        // The body of the request is the config object itself.
        return this.http.patch(`${this.apiUrl}/eventsubs/${channelId}/${subscriptionId}`, configToSave, { headers }).pipe(
          tap(() => {
            // this.clearCache(); // No need to clear cache, local state is already updated
            this.toastService.success('EN:Configuration Saved', `ES:Configuracion guardada`);
            // this.toastService.success('Configuration Saved', `Configuration for ${eventName} has been updated.`);
          }),
          catchError((error: any) => {
            const statusCode = error.status || 'Unknown';
            const reason = error.error?.message || error.message || 'Unknown error occurred';
            this.toastService.error(`Error ${statusCode}`, reason);
            return throwError(() => error);
          })
        );
      })
    );
  }
}