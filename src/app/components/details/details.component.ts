import { Component, Input, inject } from '@angular/core';
import { ChannelService } from '../../services/channel.service';
import { AuthService } from '../../services/auth.service';
import { Channel } from '../../models/channel.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Users } from '../../dummy-data';

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
  users = Users;

  // Helper functions for getting user data
  getUsername(userId: string) {
    return Users.find(user => user.id == userId)?.username ?? 'Guest';
  }
  getUserAvatar(userId: string) {
    return Users.find(user => user.id == userId)?.avatar ?? 'assets/default-avatar.png';
  }

  isGroupAdmin() {
    if (!this.channel) return false;
    const user = this.authService.getCurrentUser();
    if (!user) return false;
    return this.channelService.isGroupAdmin(user.id, this.channel.groupId);
  }

  removeUser(userId: string) {
    // ask for confirmation
    const confirmed = window.confirm("Remove user " + this.getUsername(userId) + " from channel?");
    if (!confirmed) return;

    if (!this.channel) return;
    this.channel.members = this.channel.members.filter(id => id !== userId);
    alert("User removed!")
  }
  addToChannel() {
    const username = window.prompt('Enter the username to be added: ');
    
    // handle invalid inputs
    if (!username) return;
    const addedUser = this.users.find(user => user.username == username);
    if (!addedUser) {
      alert("User doesn't exist!");
      return;
    };

    if (!this.channel) return;  // typescript was cranky
    // append user to channel member list
    this.channel.members = [ ...this.channel?.members, addedUser.id ];
    alert(addedUser.username + " has been added!");
  }
}
