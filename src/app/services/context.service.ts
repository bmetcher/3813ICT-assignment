import { Injectable, signal, computed } from '@angular/core';
import { Group } from '../models/group.model';
import { Channel } from '../models/channel.model';

@Injectable({
  providedIn: 'root'
})
export class ContextService {
  // All groups the user belongs to
  private _groups = signal<Group[]>([]);
  readonly groups = computed(() => this._groups());

  // Selected channel for chat components
  private _currentChannel = signal<Channel | null>(null);
  readonly currentChannel = computed(() => this._currentChannel());

  // Group list helpers
  setGroups(groups: Group[]) {
    const groupsWithState = groups.map(g => ({ ...g, open: false }));
    this._groups.set(groupsWithState);
  }

  // Toggle a group being open || closed
  toggleGroupOpen(groupId: string) {
    const updated = this._groups().map(g => g._id === groupId ? { ...g, open: !g.open } : g);
    this._groups.set(updated);
  }

  // currentChannel helpers
  setCurrentChannel(channel: Channel | null) {
    this._currentChannel.set(channel);
  }
  clearCurrentChannel() {
    this._currentChannel.set(null);
  }
}
