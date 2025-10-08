import { Injectable, inject } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket?: Socket;

  private auth = inject(AuthService); // inject for tokens

  // Connect to WebSocket server
  connect() {
    // get the current auth token
    const token = this.auth.token$.value;
    if (!token) {
      console.error('No token, not connecting to socket');  // not logged in
      return;
    }

    // create socket connection
    this.socket = io(environment.apiUrl, {
      auth: { token }   // send token in handshake
    });

    // connection & disconnection
    this.socket.on('connect', () => console.log('Socket connected'));
    this.socket.on('disconnect', () => console.log('Socket disconnected'));
  }

  // Emit some event to the server
  emit(event: string, data?: any) {
    this.socket?.emit(event, data);
  }

  // Listen for an event from the server
  on(event: string, callback: (...args: any[]) => void) {
    this.socket?.on(event, callback);
  }

  // Disconnect the socket manually
  disconnect() {
    this.socket?.disconnect();
  }
}
