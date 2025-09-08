import { Component, Input } from '@angular/core';
import { Channel } from '../../models/channel.model';

import { Users } from '../../dummy-data';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-output',
  imports: [CommonModule],
  templateUrl: './output.component.html',
  styleUrl: './output.component.css'
})


export class OutputComponent {
  @Input() channel: Channel | null = null;

  // Helper functions for getting user data
  getUsername(userId: string) {
    return Users.find(user => user.id == userId)?.username ?? 'Guest';
  }
  getUserAvatar(userId: string) {
    return Users.find(user => user.id == userId)?.avatar ?? 'assets/default-avatar.png';
  }
}
