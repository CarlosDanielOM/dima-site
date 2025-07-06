import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { ChatEvent, ConfigControl } from './modules/chat-events/chat-events.component'; // Adjust path as needed
import { Gamepad2, Heart, Star, Trophy, UserPlus, Users, VolumeX } from 'lucide-angular';

// Represents the data structure for a user's saved configuration in your MongoDB.
// It's a partial record, only containing what the user has customized.
export interface UserEventConfig {
  name: string; // The primary key, e.g., 'Follows'
  enabled: boolean;
  config?: Partial<ConfigControl>[]; // Only contains the values the user has changed
}

@Injectable({
  providedIn: 'root'
})
export class EventsubService {
  private apiUrl = 'https://your-api.com/api'; // This would be your backend API

  constructor(
    private http: HttpClient
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
          mergedEvent.enabled = userConfig.enabled; // Overwrite enabled status

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
      { name: 'Follows', icon: UserPlus, color: 'bg-purple-500', textColor: 'text-white', releaseStage: 'coming_soon', enabled: false, premium: false, premium_plus: false, description: { EN: 'Greet a new follower with a custom message to make them feel welcomed!', ES: 'Saluda a un nuevo seguidor, para que se sientan bienvenidos!' }, config: [{ id: 'followMessage', label: {EN: 'Follow Message', ES: 'Mensaje de Seguidor'}, type: 'text', value: 'Default follow message!' }] },
    ];
    return of(mockDefinitions);
  }

  // 2. Fetches the specific configurations for the logged-in user from your DB
  private getUserConfiguredEvents(): Observable<UserEventConfig[]> {
    // In a real app: return this.http.get<UserEventConfig[]>(`${this.apiUrl}/user/events/configurations`);
    console.log('Fetching USER-SPECIFIC configurations from local DB...');
    const mockUserConfigs: UserEventConfig[] = [
      // This user has enabled 'Follows' and set a custom message
      { 
        name: 'Follows', 
        enabled: false, 
        config: [
          { id: 'followMessage', value: 'This is MY custom follow message!' }
        ] 
      },
      // This user has enabled 'Raids', enabled clips, and set a custom viewer count
      {
        name: 'Raids',
        enabled: true,
        config: [
          { id: 'enableClips', value: true },
          { id: 'minViewers', value: 25 }
          // Note: They didn't change the raid message, so it will use the default
        ]
      }
      // Note: The user has not touched 'Hype Trains', so it will use the default (disabled).
    ];
    return of(mockUserConfigs);
  }

  // Your update/save functions would remain the same
  updateEventStatus(eventName: string, enabled: boolean): Observable<any> { /* ... */ return of({ success: true }); }
  saveEventConfiguration(eventName: string, config: any): Observable<any> { /* ... */ return of({ success: true }); }
}
