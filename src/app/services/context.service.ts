import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Group } from '../models/group.model';
import { Channel } from '../models/channel.model';
import { User } from '../models/user.model';
import { Message } from '../models/message.model';
import { Membership } from '../models/membership.model';
import { GroupService } from './group.service';
import { ChannelService } from './channel.service';
import { SocketService } from './socket.service';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ContextService {
  private socketService = inject(SocketService);
  private http = inject(HttpClient);

  setupSocketListeners(): void {
    console.log('Context: Setting up global socket listeners');
    // groups
    this.socketService.on('groupUpdated', (group: Group) => {
      console.log('Context: Group updated:', group);
      const updated = this._groups().map(g =>
        g._id === group._id ? { ...group, open: g.open } : g
      );
      this._groups.set(updated);
    });

    this.socketService.on('groupDeleted', (group: Group) => {
      console.log('Context: Group deleted:', group._id);
      this._groups.set(this._groups().filter(g => g._id !== group._id));
      this._channels.set(this._channels().filter(c => c.groupId !== group._id));
      // if current channel was in deleted group, clear it
      if (this._currentChannel()?.groupId === group._id) {
        this.clearCurrentChannel();
      }
    });

    // channels
    this.socketService.on('channelCreated', (channel: Channel) => {
      console.log('Context: Channel created:', channel);
      this._channels.set([...this._channels(), channel]);
    });

    this.socketService.on('channelUpdated', (channel: Channel) => {
      console.log('Context: Channel updated:', channel);
      const updated = this._channels().map(ch => 
        ch._id === channel._id ? channel : ch
      );
      this._channels.set(updated);
      // update current channel if it's the one that changed
      if (this._currentChannel()?._id === channel._id) {
        this._currentChannel.set(channel);
      }
    });

    this.socketService.on('channelDeleted', (channel: Channel) => {
      console.log('Context: Channel deleted:', channel._id);
      this._channels.set(this._channels().filter(ch => ch._id !== channel._id));
      // clear current channel if it was deleted
      if (this._currentChannel()?._id === channel._id) {
        this.clearCurrentChannel();
      }
    });

    // users
    this.socketService.on('userUpdated', (user: User) => {
      console.log('Context: User updated:', user);
      const updated = this._users().map(u =>
        u._id === user._id ? user: u
      );
      this._users.set(updated);
    });

    this.socketService.on('userDeleted', (user: User) => {
      console.log('Context: User deleted:', user._id);
      this._users.set(this._users().filter(u => u._id !== user._id));
    });

    // memberships (roles)
    this.socketService.on('membershipCreated', (membership: Membership) => {
      console.log('Context: Membership created:', membership);
      this._memberships.set([...this._memberships(), membership]);
    });

    this.socketService.on('membershipUpdated', (membership: Membership) => {
      console.log('Context: Membership updated:', membership);
      const updated = this._memberships().map(m => 
        m._id === membership._id ? membership : m
      );
      this._memberships.set(updated);
    });

    this.socketService.on('membershipDeleted', (membership: Membership) => {
      console.log('Context: Membership deleted:', membership);
      this._memberships.set(this._memberships().filter(m => m._id !== membership._id));
    });

    // user presence
    this.socketService.on('userJoinedChannel', (data: { userId: string, channelId: string }) => {
      console.log('User joined channel:', data);
      // reload users if it's the current channel
      if (this._currentChannel()?._id === data.channelId) {
        // trigger user reload in details component
      }
    });

    this.socketService.on('userLeftChannel', (data: { userId: string, channelId: string }) => {
      console.log('User left channel:', data);
      // reload users if it's the current channel
      if (this._currentChannel()?._id === data.channelId) {
        // trigger user reload in details component
      }
    });
  }

  // clear listeners when disconnecting
  cleanupSocketListeners(): void {
    this.socketService.off('groupUpdated');
    this.socketService.off('groupDeleted');
    this.socketService.off('channelCreated');
    this.socketService.off('channelUpdated');
    this.socketService.off('channelDeleted');
    this.socketService.off('userUpdated');
    this.socketService.off('userDeleted');
    this.socketService.off('membershipUpdated');
    this.socketService.off('membershipDeleted');
  }
  // clear context when disconnecting
  clearAllContext() {
    this._groups.set([]);
    this._channels.set([]);
    this._currentChannel.set(null);
    this._users.set([]);
    this._messages.set([]);
    this._memberships.set([]);
  }

  private groupService = inject(GroupService);
  private channelService = inject(ChannelService);

  // # Groups #
  private _groups = signal<Group[]>([]);
  readonly groups = computed(() => this._groups());

  // helper to set group list
  setGroups(groups: Group[]) {
    const groupsWithState = groups.map(g => ({ ...g, open: false }));
    this._groups.set(groupsWithState);
  }
  // toggle a group: 'open' or 'closed'
  toggleGroupOpen(groupId: string) {
    const updated = this._groups().map(group => 
      group._id === groupId ? { ...group, open: !group.open } : group
    );
    this._groups.set(updated);
  }

  // # Channels #
  private _channels = signal<Channel[]>([]);
  readonly channels = computed(() => this._channels());
  // helper to set channels list
  setChannels(channels: Channel[]) {
    this._channels.set(channels);
  }

  // # Current channel #
  private _currentChannel = signal<Channel | null>(null);
  readonly currentChannel = computed(() => this._currentChannel());

  // helpers to set and clear the current channel
  setCurrentChannel(channel: Channel | null) {
    this._currentChannel.set(channel);
  }
  clearCurrentChannel() {
    this._currentChannel.set(null);
  }

  // # Users # in currentChannel
  private _users = signal<User[]>([]);
  readonly users = computed(() => this._users());
  private _memberships = signal<Membership[]>([]);
  readonly memberships = computed(() => this._memberships());

  // helpers for: setting, adding, & removing users
  setUsers(users: User[]) {
    this._users.set(users);
  }
  addUser(user: User) {
    this._users.set([...this._users(), user]);
  }
  removeUser(userId: string) {
    this._users.set(this._users().filter(user => user._id !== userId));
  }

  // # Messages # in currentChannel
  private _messages = signal<Message[]>([]);
  readonly messages = computed(() => this._messages());

  // helpers for: set, add, remove, & clearing messages
  setMessages(messages: Message[]) {
    this._messages.set(messages);
  }
  addMessage(message: Message) {
    this._messages.set([...this._messages(), message]);
  }
  removeMessage(messageId: string) {
    this._messages.set(this._messages().filter(msg => msg._id !== messageId));
  }
  clearMessages() {
    this._messages.set([]);
  }

  // load all user context (groups & channels)
  async loadUserContext(userId: string): Promise<void> {
    try {
      console.log('Loading context for user:', userId);

      // load groups
      const groupsData = await firstValueFrom(
        this.groupService.getGroups(userId)
      );

      // set any found groups
      if (groupsData?.groups && groupsData.groups.length > 0) {
        console.log('Loaded groups:', groupsData.groups.length);
        this.setGroups(groupsData.groups);

        // load memberships included from response
        if (groupsData.memberships) {
          this._memberships.set(groupsData.memberships);
          console.log('Loaded memberships:', groupsData.memberships.length);
        }
        

        // load channels for all groups
        const allChannels: Channel[] = [];
        for (const group of groupsData.groups) {
          const channelsData = await firstValueFrom(
            this.channelService.getChannelsByGroup(group._id)
          );
          
          if (channelsData?.channels) {
            allChannels.push(...channelsData.channels);
          }
        }

        console.log('Loaded channels:', allChannels.length);
        this.setChannels(allChannels);
      } else {
        console.warn('No groups returned');
        this.setGroups([]);
        this.setChannels([]);
        this._memberships.set([]);
      }
    } catch (err) {
      console.error('Error loading user context:', err);
      throw err;
    }
  }
}
