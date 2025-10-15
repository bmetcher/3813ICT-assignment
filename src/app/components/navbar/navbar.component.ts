import { Component, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ContextService } from '../../services/context.service';
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
  readonly context = inject(ContextService);

  user = this.authService.currentUser;
  groups = this.context.groups;
  channels = this.context.channels;
  currentChannel = this.context.currentChannel;

  // debugging
  ngOnInit() {
    console.log('# Navbar Initialized #');
    console.log(' User:', this.user());
    console.log(' Groups:', this.groups());
    console.log(' Channels:', this.channels());
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
}
