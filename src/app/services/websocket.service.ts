import { Injectable, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment';

export enum ConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error'
}

export interface WebSocketConfig {
  endpoint?: string;
  transports?: string[];
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
  reconnectionDelayMax?: number;
}

@Injectable({
  providedIn: 'root'
})
export class WebsocketService implements OnDestroy {

  private ws: Socket | null = null;
  private currentEndpoint: string | null = null;
  private connectionState$ = new BehaviorSubject<ConnectionState>(ConnectionState.DISCONNECTED);
  private error$ = new Subject<Error>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private activeEndpoints = new Set<string>();
  private namespaceSockets = new Map<string, Socket>();

  constructor() {
    // Optional: Auto-connect with default endpoint
    // this.connect();
  }

  ngOnDestroy(): void {
    this.disconnect();
    this.connectionState$.complete();
    this.error$.complete();
  }

  /**
   * Get connection state as observable
   */
  get connectionState(): Observable<ConnectionState> {
    return this.connectionState$.asObservable();
  }

  /**
   * Get current connection state value
   */
  get currentState(): ConnectionState {
    return this.connectionState$.value;
  }

  /**
   * Get error stream as observable
   */
  get errors(): Observable<Error> {
    return this.error$.asObservable();
  }

  /**
   * Check if socket is connected
   */
  get isConnected(): boolean {
    return this.ws?.connected ?? false;
  }

  /**
   * Connect to websocket server
   * Connects to the base WebSocket URL and treats endpoints as event names
   */
  connect(endpoint = 'test', config: Partial<WebSocketConfig> = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      // If already connected, just add the endpoint to active list
      if (this.ws?.connected) {
        this.activeEndpoints.add(endpoint);
        resolve();
        return;
      }

      this.connectionState$.next(ConnectionState.CONNECTING);

      const defaultConfig: WebSocketConfig = {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        ...config
      };

      // Use environment-based URL - connect to base URL, not specific namespace
      const baseUrl = environment.production
        ? environment.DIMA_API.replace(/^http/, 'ws')
        : 'ws://localhost:3000';

      // Connect to root namespace, endpoints will be used as event names
      const socketUrl = baseUrl;

      try {
        this.ws = io(socketUrl, defaultConfig);
        this.currentEndpoint = endpoint;
        this.activeEndpoints.add(endpoint);
        this.setupEventListeners(resolve, reject);
      } catch (error) {
        this.handleError(error as Error, reject);
      }
    });
  }

  /**
   * Disconnect from websocket server
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.removeAllListeners();
      this.ws.disconnect();
      this.ws = null;
      this.currentEndpoint = null;
      this.activeEndpoints.clear();
      this.reconnectAttempts = 0;
      this.connectionState$.next(ConnectionState.DISCONNECTED);
    }
  }

  /**
   * Disconnect specific endpoint (removes from active endpoints list)
   */
  disconnectEndpoint(endpoint: string): void {
    this.activeEndpoints.delete(endpoint);

    // Remove all listeners for this endpoint
    if (this.ws) {
      this.ws.off(endpoint);
    }

    // If no more active endpoints, disconnect completely
    if (this.activeEndpoints.size === 0) {
      this.disconnect();
    }
  }

  /**
   * Emit event with data
   */
  emit(event: string, data: unknown): boolean {
    if (!this.ws?.connected) {
      console.error('Cannot emit event: WebSocket not connected');
      return false;
    }

    try {
      this.ws.emit(event, data);
      return true;
    } catch (error) {
      this.handleError(error as Error);
      return false;
    }
  }

  /**
   * Listen to event with callback
   */
  on<T = unknown>(event: string, callback: (data: T) => void): void {
    if (!this.ws) {
      console.error('Cannot listen to event: WebSocket not initialized');
      return;
    }

    this.ws.on(event, callback);
  }

  /**
   * Listen to event once
   */
  once<T = unknown>(event: string, callback: (data: T) => void): void {
    if (!this.ws) {
      console.error('Cannot listen to event: WebSocket not initialized');
      return;
    }

    this.ws.once(event, callback);
  }

  /**
   * Remove event listener
   */
  off(event: string, callback?: (...args: any[]) => void): void {
    if (!this.ws) {
      return;
    }

    if (callback) {
      this.ws.off(event, callback);
    } else {
      this.ws.off(event);
    }
  }

  /**
   * Reconnect to server
   */
  reconnect(): Promise<void> {
    if (!this.currentEndpoint) {
      throw new Error('No endpoint available for reconnection');
    }

    this.disconnect();
    return this.connect(this.currentEndpoint);
  }

  /**
   * Connect to a specific socket.io namespace (e.g., "/site/analytics/live-channels")
   */
  connectNamespace(namespacePath: string, config: Partial<WebSocketConfig> = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.namespaceSockets.has(namespacePath)) {
        resolve();
        return;
      }

      const defaultConfig: WebSocketConfig = {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        ...config
      };

      // const baseUrl = environment.production
      //   ? environment.DIMA_API.replace(/^http/, 'ws')
      //   : 'ws://localhost:3000';

      const baseUrl = environment.DIMA_API.replace(/^http/, 'ws');

      const ns = namespacePath.startsWith('/') ? namespacePath : `/${namespacePath}`;

      try {
        const socket = io(`${baseUrl}${ns}`, defaultConfig);

        // Basic lifecycle wiring
        socket.on('connect', () => {
          resolve();
        });

        socket.on('connect_error', (error: Error) => {
          this.handleError(error, reject);
        });

        this.namespaceSockets.set(ns, socket);
      } catch (error) {
        this.handleError(error as Error, reject);
      }
    });
  }

  /**
   * Listen to an event on a specific namespace
   */
  onNamespace<T = unknown>(namespacePath: string, event: string, callback: (data: T) => void): void {
    const ns = namespacePath.startsWith('/') ? namespacePath : `/${namespacePath}`;
    const socket = this.namespaceSockets.get(ns);
    if (!socket) {
      console.error(`Cannot listen: namespace not connected: ${ns}`);
      return;
    }
    socket.on(event, callback);
  }

  /**
   * Remove event listener on a specific namespace
   */
  offNamespace(namespacePath: string, event: string, callback?: (...args: any[]) => void): void {
    const ns = namespacePath.startsWith('/') ? namespacePath : `/${namespacePath}`;
    const socket = this.namespaceSockets.get(ns);
    if (!socket) return;
    if (callback) {
      socket.off(event, callback);
    } else {
      socket.off(event);
    }
  }

  /**
   * Disconnect a specific namespace
   */
  disconnectNamespace(namespacePath: string): void {
    const ns = namespacePath.startsWith('/') ? namespacePath : `/${namespacePath}`;
    const socket = this.namespaceSockets.get(ns);
    if (!socket) return;
    socket.removeAllListeners();
    socket.disconnect();
    this.namespaceSockets.delete(ns);
  }

  /**
   * Setup websocket event listeners
   */
  private setupEventListeners(resolve: () => void, reject: (error: Error) => void): void {
    if (!this.ws) return;

    this.ws.on('connect', () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.connectionState$.next(ConnectionState.CONNECTED);
      resolve();
    });

    this.ws.on('disconnect', (reason: string) => {
      console.log('WebSocket disconnected:', reason);
      this.connectionState$.next(ConnectionState.DISCONNECTED);

      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect
        this.attemptReconnect();
      }
    });

    this.ws.on('connect_error', (error: Error) => {
      console.error('WebSocket connection error:', error);
      this.connectionState$.next(ConnectionState.ERROR);
      this.handleError(error, reject);
    });

    this.ws.on('reconnect', (attemptNumber: number) => {
      console.log(`WebSocket reconnected after ${attemptNumber} attempts`);
      this.connectionState$.next(ConnectionState.CONNECTED);
    });

    this.ws.on('reconnect_attempt', (attemptNumber: number) => {
      console.log(`WebSocket reconnection attempt ${attemptNumber}`);
      this.connectionState$.next(ConnectionState.RECONNECTING);
    });

    this.ws.on('reconnect_failed', () => {
      console.error('WebSocket reconnection failed');
      this.connectionState$.next(ConnectionState.ERROR);
    });
  }

  /**
   * Handle connection errors
   */
  private handleError(error: Error, reject?: (error: Error) => void): void {
    this.error$.next(error);

    if (reject) {
      reject(error);
    }
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 5000);

    setTimeout(() => {
      if (this.currentEndpoint && !this.ws?.connected) {
        console.log(`Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
        this.connect(this.currentEndpoint).catch(error => {
          console.error('Reconnection failed:', error);
        });
      }
    }, delay);
  }
}
