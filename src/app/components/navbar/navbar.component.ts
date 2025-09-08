import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  user = this.authService.currentUser;

  // channel to display in Chat component
  selectedChannel: string | null = null;  

  
  // Click event for Settings page
  openSettings() {
    this.router.navigate(['/settings']);
  }

  openProfile() {
    console.log("profile pop-up should be here!");
  }

  // getter for groups signal
  get userGroups() {
    return this.authService.groups();
  }

  // "select" a channel to become active for Chat component
  selectChannel(channel: any) {
    this.selectedChannel = channel.name;
    console.log("New channel: " + channel.name)
  }

}
