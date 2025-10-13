import { Injectable, signal, computed } from '@angular/core';
import { Group } from '../models/group.model';
import { Channel } from '../models/channel.model';
import { User } from '../models/user.model';
import { Message } from '../models/message.model';
import { Membership } from '../models/membership.model';

@Injectable({
  providedIn: 'root'
})
export class ContextService {
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
}
