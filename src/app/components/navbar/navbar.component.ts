import { Component, inject, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ContextService } from '../../services/context.service';
import { UtilityService } from '../../services/utility.service';
import { ChannelService } from '../../services/channel.service';
import { GroupService } from '../../services/group.service';
import { Channel } from '../../models/channel.model';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  private channelService = inject(ChannelService);
  private groupService = inject(GroupService);
  readonly utility = inject(UtilityService);
  readonly context = inject(ContextService);

  user = this.authService.currentUser;
  groups = this.context.groups;
  channels = this.context.channels;
  currentChannel = this.context.currentChannel;

  hoveredGroup: string | null = null;
  hoveredChannel: string | null = null;
  showGroupDropdown: string | null = null;
  showChannelDropdown: string | null = null;

  groupDropdownTop: number = 0;
  groupDropdownLeft: number = 0;
  channelDropdownTop: number = 0;
  channelDropdownLeft: number = 0;

  // debugging
  ngOnInit() {
    console.log('# Navbar Initialized #');
    console.log(' User:', this.user());
    console.log(' Groups:', this.groups());
    console.log(' Channels:', this.channels());

    // close dropdowns when clicking outside
    document.addEventListener('click', this.closeDropdowns);
  }
  ngOnDestroy() {
    document.removeEventListener('click', this.closeDropdowns);
  }

  private closeDropdowns = () => {
    this.showGroupDropdown = null;
    this.showChannelDropdown = null;
  }

  // Click event for Settings page
  openSettings() {
    this.router.navigate(['/settings']);
  }

  // (PLACEHOLDER) quick settings (log out, change status, etc.)
  openProfile() {
    console.log("profile pop-up should be here!");
  }

  


  // Select an active channel for the Chat component
  selectChannel(channel: Channel) {
    this.context.setCurrentChannel(channel);
    console.log("Switched to channel: " + channel.name);
  }

  // For showing currentChannel in UI
  isActive(channel: Channel) {
    return this.currentChannel()?. _id === channel._id;
  }

  // Helper to toggle a group open/closed
  toggleGroup(groupId: string) {
    this.context.toggleGroupOpen(groupId);
  }

  // Check if user is admin of a group
  isGroupAdmin(groupId: string): boolean {
    const userId = this.authService.currentUser()?._id;
    if (!userId) return false;

    // check if user has admin membership on this group
    const membership = this.context.memberships().find(
      mem => mem.groupId === groupId && mem.userId === userId
    );


    if (membership?.role === 'admin' || membership?.role === 'super') {
      return true;
    } else {
      return false;
    }
  }

  // toggle a group or channel dropdown for admin click event
  toggleGroupDropdown(groupId: string, event: MouseEvent) {
    event.stopPropagation();

    if (this.showGroupDropdown === groupId) {
      this.showGroupDropdown = null;
    } else {
      this.showGroupDropdown = groupId;
      const target = event.target as HTMLElement;
      const rect = target.getBoundingClientRect();
      this.groupDropdownTop = rect.bottom + 4;
      this.groupDropdownLeft = rect.left;
    }
    this.showChannelDropdown = null;
  }
  toggleChannelDropdown(channelId: string, event: MouseEvent) {
    event.stopPropagation();

    if (this.showChannelDropdown === channelId) {
      this.showChannelDropdown = null;
    } else {
      this.showChannelDropdown = channelId;
      const target = event.target as HTMLElement;
      const rect = target.getBoundingClientRect();
      this.channelDropdownTop = rect.bottom + 4;
      this.channelDropdownLeft = rect.left;

      console.log('Channel dropdown:', channelId, this.channelDropdownTop, this.channelDropdownLeft);
    }
    this.showGroupDropdown = null;
  }

  // edit a group
  editGroup(groupId: string) {
    const group = this.context.groups().find(g => g._id === groupId);
    if (!group) return;

    const newName = prompt('Enter new group name:', group.name);
    if (newName && newName.trim() && newName !== group.name) {
      this.groupService.updateGroup(groupId, { name: newName.trim() }).subscribe({
        next: () => {
          console.log('Group updated successfully');
          this.showGroupDropdown = null;
        },
        error: (err) => {
          console.error('Fialed to update group:', err);
          alert('Failed to update group');
        }
      });
    }
  }

  // delete a group
  deleteGroup(groupId: string) {
    const group = this.context.groups().find(g => g._id === groupId);
    if (!group) return;

    if (confirm(`Delete "${group.name}"? This will delete all channels and cannot be undone!`)) {
      this.groupService.deleteGroup(groupId).subscribe({
        next: () => {
          console.log('Group deleted successfully');
          this.showGroupDropdown = null;
        },
        error: (err) => {
          console.error('Failed to delete group:', err);
          alert('Failed to delete group');
        }
      });
    }
  }

  // create a channel
  createChannel(groupId: string) {
    const name = prompt('Enter channel name:');
    const description = prompt('Enter channel description (optional):') || '';

    if (name && name.trim()) {
      this.channelService.createChannel({
        groupId,
        name: name.trim(),
        description,
        bannedUsers: []
      }).subscribe({
        next: () => {
          console.log('Channel created successfully');
          this.showGroupDropdown = null;
        },
        error: (err) => {
          console.error('Failed to create channel:', err);
          alert('Failed to create channel');
        }
      });
    }
  }
  // edit a channel
  editChannel(channelId: string) {
    const channel = this.context.channels().find(c => c._id === channelId);
    if (!channel) return;

    const newName = prompt('Enter new channel name:', channel.name);
    if (newName && newName.trim() && newName !== channel.name) {
      this.channelService.updateChannel(channelId, { name: newName.trim() }).subscribe({
        next: () => {
          console.log('Channel updated successfully');
          this.showChannelDropdown = null;
        },
        error: (err) => {
          console.error('Failed to update channel:', err);
          alert('Failed to update channel');
        }
      });
    }
  }
  // delete a channel
  deleteChannel(channelId: string) {
    const channel = this.context.channels().find(c => c._id === channelId);
    if (!channel) return;
    
    if (confirm(`Delete #${channel.name}?`)) {
      this.channelService.deleteChannel(channelId).subscribe({
        next: () => {
          console.log('Channel deleted successfully');
          this.showChannelDropdown = null;
        },
        error: (err) => {
          console.error('Failed to delete channel:', err);
          alert('Failed to delete channel');
        }
      });
    }
  }

  isSuperAdmin(): boolean {
    return this.context.memberships().some(mem => mem.role === 'super');
  }

  createUser() {
    this.router.navigate(['/admin/create-user']);
  }

  createGroup() {
    const name = prompt('Enter group name:');
    if (name && name.trim()) {
      this.groupService.createGroup({ name: name.trim() }).subscribe({
        next: (response) => {
          console.log('Group created:', response);

          // manually reload user context to see new group
          const userId = this.authService.currentUser()?._id;
          if (userId) {
            this.context.loadUserContext(userId);
          }
        },
        error: (err) => alert('Failed to create group:' + err.error?.error)
      });
    }
  }
}
