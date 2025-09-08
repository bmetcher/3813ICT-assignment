import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ChannelService } from '../../services/channel.service';
import { Groups, Channels } from '../../dummy-data';


@Component({
  selector: 'app-navbar',
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  private router = inject(Router);
  private authService = inject(AuthService);
  private channelService = inject(ChannelService);

  user = this.authService.currentUser;

  // Click event for Settings page
  openSettings() {
    this.router.navigate(['/settings']);
  }

  // (placeholder) quick settings (log out, change status, etc.)
  openProfile() {
    console.log("profile pop-up should be here!");
  }

  // getter for groups signal
  get userGroups() {
    return this.authService.groups();
  }

  // "select" a channel to become active for Chat component
  selectChannel(channelId: string) {
    this.channelService.setChannel(channelId);
    console.log("New channel: " + channelId)
  }

  // helper to get channel names
  getChannelName(channelId: string) {
    return Channels.find(ch => ch.id == channelId)?.name ?? 'Unknown';
  }

}
