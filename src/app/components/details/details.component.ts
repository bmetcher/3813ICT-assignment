import { Component, Input, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Channel } from '../../models/channel.model';
import { User } from '../../models/user.model';
import { ContextService } from '../../services/context.service';
import { ChannelService } from '../../services/channel.service';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-details',
  imports: [CommonModule, FormsModule],
  templateUrl: './details.component.html',
  styleUrl: './details.component.css'
})
export class DetailsComponent {
  @Input() channel: Channel | null = null;

  private channelService = inject(ChannelService);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private context = inject(ContextService);

  users = this.context.users;
  currentChannel = this.context.currentChannel;

  constructor() {
    // reload users automatically when currentChannel changes
    effect(() => {
      const channel = this.context.currentChannel();
      if(channel) {
        this.userService.getUsersByChannel(channel._id).subscribe(users => {
          this.context.setUsers(users);
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
