import { Injectable, signal, computed } from '@angular/core';
import { Channel } from '../models/channel.model';
import { Channels } from '../dummy-data';

@Injectable({
  providedIn: 'root'
})
export class ChannelService {
  // selected channel from Navbar
  private _selectedChannel = signal<Channel | null>(null);
  
  // read-only computed values from the selected channel
  readonly currentChannel = computed(() => this._selectedChannel());
  readonly messages = computed(() => this._selectedChannel()?.messages ?? []);

  // set current channel by ID
  setChannel(channelId: string) {
    const channel = Channels.find(ch => ch.id == channelId) ?? null;
    this._selectedChannel.set(channel);
  }

  // add a message to the current channel
  addMessage(message: { userId: string, content: string, timestamp: Date }) {
    const channel = this._selectedChannel();
    if (!channel) return;

    // create a new array to handle immutability
    const updatedChannel: Channel = {
      ...channel,
      messages: [...channel.messages, message]
    }

    // trigger reactivity manually
    this._selectedChannel.set(updatedChannel);
  }
}
