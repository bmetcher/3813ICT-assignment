import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ContextService } from '../../services/context.service';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  private router = inject(Router);
  private authService = inject(AuthService);
  private context = inject(ContextService);

  user = this.authService.currentUser;

  // Click event for Settings page
  openSettings() {
    this.router.navigate(['/settings']);
  }

  // (placeholder) quick settings (log out, change status, etc.)
  openProfile() {
    console.log("profile pop-up should be here!");
  }

  // Fetch the current list of user groups from context service
  get userGroups() {
    return this.context.groups();
  }

  // Select an active channel for the Chat component
  selectChannel(channelId: string) {
    this.context.setCurrentChannel({ _id: channelId } as any);
    console.log("New channel: " + channelId);
  }
}
