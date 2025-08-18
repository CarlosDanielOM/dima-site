import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  private ws: Socket;

  constructor() {
    this.ws = io('http://localhost:3000', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });
  }

  emit(event: string, data: any) {
    this.ws.emit(event, data);
  }

  on(event: string, callback: (data: any) => void) {
    this.ws.on(event, callback);
  }

  disconnect() {
    this.ws.disconnect();
  }

  connect() {
    this.ws.connect();
  }
}
