import { Injectable, inject } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  public socket?: Socket;             // public socket for cleanup

  private auth = inject(AuthService); // inject for tokens

  // Connect to WebSocket server
  connect(): void {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

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
    this.socket.on('connect', () => console.log('Socket connected:', this.socket?.id));
    this.socket.on('disconnect', (reason) => console.log('Socket disconnected:', reason));
    this.socket.on('connect_error', (err) => console.log('Socket connection error:', err.message));
  }

  // Emit some event to the server
  emit(event: string, data?: any): void {
    if (!this.socket?.connected) {
      console.error('Socket not connected, cannot emit:', event);
      return;
    }
    this.socket.emit(event, data);
  }

  // Listen for an event from the server
  on(event: string, callback: (...args: any[]) => void): void {
    if (!this.socket) {
      console.error('Socket not initialized');
      return;
    }
    this.socket.on(event, callback);
  }

  // Remove a listener
  off(event: string, callback?: (...args: any[]) => void): void {
    if (!this.socket) return;
    if (callback) {
      this.socket.off(event, callback);
    } else {
      this.socket.off(event);
    }
  }

  // Disconnect the socket manually
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      console.log('Socket disconnected manually');
    }
  }

  // Check if socket is connected
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}
