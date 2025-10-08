import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Channel } from '../models/channel.model';

@Injectable({
  providedIn: 'root'
})
export class ChannelService {
  private http = inject(HttpClient);
  private API = `${environment.apiUrl}/channels`;

  // currently selected channel
  private _selectedChannel = signal<Channel | null>(null);
  readonly currentChannel = computed(() => this._selectedChannel());

  // Fetch channels for a group
  getChannelsByGroup(groupId: string) {
    return this.http.get<{ channels: Channel[] }>(
      `${this.API}/${groupId}`
    );
  }

  // Create a new channel
  createChannel(channel: Partial<Channel>) {
    return this.http.post<{ newChannel: Channel }>(
      this.API, { channel }
    );
  }

  // Update a channel by ID
  updateChannel(channelId: string, update: Partial<Channel>) {
    return this.http.put<{ channel: Channel }>(
      `${this.API}/${channelId}`, 
      { update }
    );
  }

  // Delete a channel
  deleteChannel(channelId: string) {
    return this.http.delete<{ success: boolean }>(
      `${this.API}/${channelId}`
    );
  }

  // Select a channel reactively
  setSelectedChannel(channel: Channel | null) {
    this._selectedChannel.set(channel);
  }
}
