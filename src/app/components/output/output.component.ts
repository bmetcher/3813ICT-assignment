import { Component, Input, inject, signal, computed, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Channel } from '../../models/channel.model';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-output',
  imports: [CommonModule],
  templateUrl: './output.component.html',
  styleUrl: './output.component.css'
})
export class OutputComponent {
  private userService = inject(UserService);

  @Input() channel: Channel | null = null;
  // Signal holding loaded users
  private users = signal<User[]>([]);

  // Update when channel changes
  ngOnChanges(changes: SimpleChanges) {
    if (changes['channel'] && this.channel) {
      this.userService.getUsersByChannel(this.channel._id)
        .subscribe(users => this.users.set(users));
    }
  }

  // Helper functions for getting user data
  getUsername(userId: string) {
    return this.users().find(user => user._id == userId)?.username ?? 'Guest';
  }
  getUserAvatar(userId: string) {
    return this.users().find(user => user._id == userId)?.avatar ?? 'assets/default-avatar.png';
  }
}
