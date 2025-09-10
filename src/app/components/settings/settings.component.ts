import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings',
  imports: [FormsModule, CommonModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  user = this.authService.currentUser();
  originalUser: any = null;
  editing = false;

  // toggle editing user settings
  toggleEdit() {
    if (!this.editing) {
      // enter edit mode with a copy of user
      this.originalUser = { ...this.user };
      this.editing = true;
    } else {
      // leave edit mode
      const confirmed = window.confirm("Save your changes?");
      if (confirmed) {
        this.authService.setCurrentUser(this.user);
      } else {
        // restore old values if cancelled
        this.user = { ...this.originalUser };
        this.authService.setCurrentUser(this.user);
      }
      this.editing = false;
    }
  }

  // return to Chat component
  backToChat() {
    this.router.navigateByUrl('/chat');
  }
  goToAdmin() {
    this.router.navigateByUrl('/admin')
  }
  // helper for logout
  logout() {
    const confirmed = window.confirm("Confirm logging out?");
      if (confirmed) {
        this.authService.logout();
      }
  }
}
