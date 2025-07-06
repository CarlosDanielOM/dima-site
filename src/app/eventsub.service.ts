import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, forkJoin } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { ChatEvent, ConfigControl } from './modules/chat-events/chat-events.component'; // Adjust path as needed
import { Gamepad2, Heart, Star, Trophy, UserPlus, Users, VolumeX } from 'lucide-angular';
import { UserService } from './user.service';
import { Router } from '@angular/router';

// Represents the data structure for a user's saved configuration in your MongoDB.
// It's a partial record, only containing what the user has customized.
export interface UserEventConfig {
  name: string; // The primary key, e.g., 'Follows', which corresponds to ChatEvent.name
  enabled: boolean;
  config?: Partial<ConfigControl>[]; // Only contains the values the user has changed
}

export interface BackendSubscription {
  id: string;
  status: string;
  type: string;
  version: string;
  enabled: boolean;
  condition: {
    broadcaster_user_id: string;
    [key: string]: string;
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
  id: string,
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
  private apiUrl = 'https://api.domdimabot.com'; // This would be your backend API

  constructor(
    private http: HttpClient,
    private userService: UserService,
    private router: Router,
  ) { }

  // This remains the main function your component calls.
  getEvents(): Observable<ChatEvent[]> {
    return forkJoin({
      // 1. Get all possible event "templates" your bot supports
      allSupportedEvents: this.getBotSupportedEvents(),
      // 2. Get the specific configurations this user has saved
      userConfigs: this.getUserConfiguredEvents()
    }).pipe(
      map(({ allSupportedEvents, userConfigs }) => {
        // This is the new, more powerful merging logic
        return allSupportedEvents.map(defaultEvent => {
          // Find if the user has a saved configuration for this event
          const userConfig = userConfigs.find(c => c.name === defaultEvent.name);

          // If they don't, just return the default template
          if (!userConfig) {
            return defaultEvent;
          }

          // If they do, merge the user's settings into the default template
          const mergedEvent = { ...defaultEvent };
          mergedEvent.enabled = userConfig.enabled ?? false; // Overwrite enabled status

          // If there's a config to merge, do a deep merge on the controls
          if (mergedEvent.config && userConfig.config) {
            mergedEvent.config = mergedEvent.config.map(defaultControl => {
              const userControl = userConfig.config?.find(c => c.id === defaultControl.id);
              // If the user has a saved value for this control, use it
              if (userControl && userControl.value !== undefined) {
                return { ...defaultControl, value: userControl.value };
              }
              // Otherwise, keep the default
              return defaultControl;
            });
          }
          
          return mergedEvent;
        });
      })
    );
  }

  // --- Helper Functions ---

  // 1. Fetches the master list of all events your bot can handle from your DB
  private getBotSupportedEvents(): Observable<ChatEvent[]> {
    // In a real app: return this.http.get<ChatEvent[]>(`${this.apiUrl}/events/definitions`);
    console.log('Fetching all supported event definitions from local DB...');
    const mockDefinitions: ChatEvent[] = [
      { name: 'Follows', type: 'channel.follow', version: '2', icon: UserPlus, color: 'bg-purple-500', textColor: 'text-white', releaseStage: 'coming_soon', enabled: false, premium: false, premium_plus: false, description: { EN: 'Greet a new follower with a custom message to make them feel welcomed!', ES: 'Saluda a un nuevo seguidor, para que se sientan bienvenidos!' }, config: [{ id: 'followMessage', label: {EN: 'Follow Message', ES: 'Mensaje de Seguidor'}, type: 'text', value: 'Thank you for the follow $(user)! Hope you enjoy the stream!' }] },
    ];
    return of(mockDefinitions);
  }

  // 2. Fetches the specific configurations for the logged-in user from your DB
  private getUserConfiguredEvents(): Observable<UserEventConfig[]> {
    // In a real app: return this.http.get<UserEventConfig[]>(`${this.apiUrl}/user/events/configurations`);
    console.log('Fetching USER-SPECIFIC configurations from local DB...');
    const channelId = this.userService.getUserId().toString();
    const token = this.userService.getToken();
    const headers = new HttpHeaders().set('Authorization', `${token}`);
    return this.http.get<{ data: BackendSubscription[] }>(`${this.apiUrl}/eventsubs/${channelId}`, { headers }).pipe(
      tap(response => console.log('Raw response from backend:', response)),
      map(response => {
        const subscriptionsArray = response.data || [];

        return subscriptionsArray
          .filter((sub: any) => sub && sub.type) // Filter out any empty/invalid objects
          .map((subscription: BackendSubscription) => ({
            name: subscription.type,
            enabled: subscription.enabled,
        }));
      }),
      tap(userConfigs => console.log('Mapped user configs:', userConfigs))
    );
  }

  // Your update/save functions would remain the same
  updateEventStatus(eventType: string, enabled: boolean): Observable<any> {
    const eventDefinition = this.getBotSupportedEvents().pipe(
      map(events => events.find(event => event.type === eventType))
    );

    return eventDefinition.pipe(
      switchMap(event => {
        if (!event) {
          throw new Error(`Event definition for ${eventType} not found`);
        }
        
        const channelId = this.userService.getUserId().toString();
        const token = this.userService.getToken();
        const headers = new HttpHeaders().set('Authorization', `${token}`);

        if (enabled) {
          // SUBSCRIBE to the event
          const body = {
            type: event.type,
            version: event.version,
            condition: { broadcaster_user_id: channelId, moderator_user_id: '698614112' }
          };
          return this.http.post(`${this.apiUrl}/eventsubs/${channelId}`, body, { headers });
        } else {
          // UNSUBSCRIBE from the event
          // 1. Get the subscription ID from your backend
          return this.getSubscription(event.type).pipe(
            switchMap(subscription => {
              if (!subscription) {
                // If there's no subscription, we don't need to do anything.
                // This can happen if the user disables an event that was never enabled on the backend.
                return of({ success: true, message: 'Subscription not found, nothing to delete.' });
              }
              // 2. Send the DELETE request
              return this.http.delete(`${this.apiUrl}/eventsubs/${channelId}?id=${subscription.id}`, { headers });
            })
          );
        }
      })
    );
  }

  getSubscription(type: string): Observable<Subscription | null> {
    const channelId = this.userService.getUserId().toString();
    const token = this.userService.getToken();
    const headers = new HttpHeaders().set('Authorization', `${token}`);

    return this.http.get<Subscription[]>(`${this.apiUrl}/eventsubs/${channelId}?type=${type}`, { headers }).pipe(
      tap(subscriptions => console.log(subscriptions, {type})),
      map(subscriptions => subscriptions.length > 0 ? subscriptions[0] : null)
    );
  }
  
  saveEventConfiguration(eventName: string, config: any): Observable<any> { /* ... */ return of({ success: true }); }
}
