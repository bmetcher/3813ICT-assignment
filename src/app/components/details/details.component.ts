import { Component, Input, inject, effect, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Channel } from '../../models/channel.model';
import { GroupService } from '../../services/group.service';
import { BanService } from '../../services/ban.service';
import { AuthService } from '../../services/auth.service';
import { ContextService } from '../../services/context.service';
import { UserService } from '../../services/user.service';
import { UtilityService } from '../../services/utility.service';

@Component({
  selector: 'app-details',
  imports: [CommonModule, FormsModule],
  templateUrl: './details.component.html',
  styleUrl: './details.component.css'
})
export class DetailsComponent implements OnInit {
  @Input() channel: Channel | null = null;

  private groupService = inject(GroupService);
  private banService = inject(BanService);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private context = inject(ContextService);
  readonly utility = inject(UtilityService);

  users = this.context.users;
  currentChannel = this.context.currentChannel;

  hoveredUser: string | null = null;
  showUserDropdown: string | null = null;
  dropdownTop: number = 0;
  dropdownLeft: number = 0;

  ngOnInit() {
    document.addEventListener('click', this.closeDropdowns);
  }
  ngOnDestroy() {
    document.removeEventListener('click', this.closeDropdowns);
  }

  private closeDropdowns = () => {
    this.showUserDropdown = null;
  }

  toggleUserDropdown(userId: string, event: MouseEvent) {
    if (this.showUserDropdown === userId) {
      this.showUserDropdown = null;
    } else {
      this.showUserDropdown = userId;

      // calculate dropdown position based on click position
      const target = event.target as HTMLElement;
      const rect = target.getBoundingClientRect();

      // position below ant to left of the gear icon
      this.dropdownTop = rect.bottom + 4;
      this.dropdownLeft = rect.right - 200;
    }
  }

  // check if current user can manage a hovered user
  canManageUser(userId: string): boolean {
    const currentUserId = this.authService.currentUser()?._id;
    const currentChannel = this.currentChannel();
    if (!currentChannel || !currentUserId) return false;
    // no managing yourself
    if (userId === currentUserId) return false;

    // get target user's role
    const targetMembership = this.context.memberships().find(
      mem => mem.userId === userId && mem.groupId === currentChannel.groupId
    );

    // can't manage super admins or other admins
    if (targetMembership?.role === 'super' || targetMembership?.role === 'admin') {
      return false
    }

    // must be admin of the group
    const currentMembership = this.context.memberships().find(
      mem => mem.groupId === currentChannel.groupId && mem.userId === currentUserId
    );

    // must be admin or super to manage users
    return (currentMembership?.role === 'admin' || currentMembership?.role === 'super');
  }

  // determine showing "promote" or "demote"
  getUserRole(userId: string): string {
    const currentChannel = this.currentChannel();
    if (!currentChannel) return 'user';

    const membership = this.context.memberships().find(
      mem => mem.userId === userId && mem.groupId === currentChannel.groupId
    );
    return membership?.role || 'user';
  }

  // Selecting Promote User
  promoteUser(userId: string): any {
    const currentChannel = this.currentChannel();
    if (!currentChannel) return;

    const user = this.users().find(u => u._id === userId);
    if (!user) return;

    console.log('Promoting user:', userId, 'in group:', currentChannel.groupId);  // debug

    if (confirm(`Promote ${user.username} to Group Admin?`)) {
      this.groupService.updateGroupRole(currentChannel.groupId, userId, 'admin').subscribe({
        next: (response) => {
          console.log('Promote response:', response); // debug
          console.log('User promoted successfully');
          this.showUserDropdown = null;
        },
        error: (err) => {
          console.error('Failed to promote user:', err);
          alert('Failed to promote user:' + (err.error?.error || err.message));
        }
      });
    }
  }

  // Selecting Demote User
  demoteUser(userId: string): any {
    const currentChannel = this.currentChannel();
    if (!currentChannel) return 'user';

    const user = this.users().find(u => u._id === userId);
    if (!user) return;

    if (confirm(`Demote ${user.username} to regular User?`)) {
      this.groupService.updateGroupRole(currentChannel.groupId, userId, 'user').subscribe({
        next: () => {
          console.log('User demoted successfully');
          this.showUserDropdown = null;
        },
        error: (err) => {
          console.error('Failed to demote user:', err);
          alert('Failed to demote user');
        }
      });
    }
  }

  banUser(userId: string): any {
    const currentChannel = this.currentChannel();
    if (!currentChannel) return 'user';

    const user = this.users().find(u => u._id === userId);
    if (!user) return;

    const currentUserId = this.authService.currentUser()?._id;
    if (!currentUserId) return;

    let reason = prompt(`Reason for banning ${user.username} (optional):`, '');
    if (reason === null) { reason = '' }
    const durationStr = prompt(`Duration in minutes (empty means permanent):', ''`);
    const duration = durationStr ? parseInt(durationStr) : -1;

    this.banService.createBan(
      currentChannel.groupId,
      userId,
      { reason, duration },
      currentChannel._id
    ).subscribe({
      next: () => {
        console.log('User banned successfully');
        this.showUserDropdown = null;
        alert(`${user.username} has been banned`);
      },
      error: (err) => {
        console.error('Failed to ban user:', err);
        alert('Failed to ban user');
      }
    });
  }

  // remove a user from the group
  removeUser(userId: string): any {
    const currentChannel = this.currentChannel();
    if (!currentChannel) return 'user';

    const user = this.users().find(u => u._id === userId);
    if (!user) return;

    if (confirm(`Remove ${user.username} from the group? They will lose access to all channels!`)) {
      this.groupService.removeUser(currentChannel.groupId, userId).subscribe({
        next: () => {
          console.log('User removed successfully');
          this.showUserDropdown = null;
          // remove from local state
          this.context.removeUser(userId);
        },
        error: (err) => {
          console.error('Failed to remove user:', err);
          alert('Failed to remove user');
        }
      });
    }
  }


  constructor() {
    // reload users automatically when currentChannel changes
    effect(() => {
      const channel = this.context.currentChannel();
      console.log('Details: Channel changed to:', channel?.name);

      if(channel) {
        this.userService.getUsersByChannel(channel._id).subscribe({
          next: (users) => {
            console.log('Details Loaded users:', users.length);
            this.context.setUsers(users);
          },
          error: (err) => {
            console.error('Details: Failed to load users:', err);
          }
        });
      } else {
        this.context.setUsers([]);
      }
    });
  }

  // Helper functions for getting user data
  getUsername(userId: string) {
    return this.context.users().find(user => user._id === userId)?.username || 'Unknown';
  }
  getUserAvatar(userId: string) {
    return this.context.users().find(user => user._id === userId)?.avatar || 'assets/default-avatar.png';
  }
}
