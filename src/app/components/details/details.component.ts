import { Component, Input, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Channel } from '../../models/channel.model';
import { ContextService } from '../../services/context.service';
import { UserService } from '../../services/user.service';
import { UtilityService } from '../../services/utility.service';

@Component({
  selector: 'app-details',
  imports: [CommonModule, FormsModule],
  templateUrl: './details.component.html',
  styleUrl: './details.component.css'
})
export class DetailsComponent {
  @Input() channel: Channel | null = null;

  private userService = inject(UserService);
  private context = inject(ContextService);
  readonly utility = inject(UtilityService);

  users = this.context.users;
  currentChannel = this.context.currentChannel;

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
