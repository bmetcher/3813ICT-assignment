import { Component, Input } from '@angular/core';
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

  // Helper functions for getting user data
  getUsername(userId: string) {
    return Users.find(user => user.id == userId)?.username ?? 'Guest';
  }
  getUserAvatar(userId: string) {
    return Users.find(user => user.id == userId)?.avatar ?? 'assets/default-avatar.png';
  }
}
