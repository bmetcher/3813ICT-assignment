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
  editing = false;

  // toggle editing user settings
  toggleEdit() {
    if (!this.editing) {
      // ask user to confirm changes
      const confirmed = window.confirm("Are you sure you want to save these changes?");
      if (!confirmed) return;

      // save changes to localStorage
      this.authService.setCurrentUser(this.user);
    }
    this.editing = !this.editing;
  }

  // return to Chat component
  backToChat() {
    this.router.navigate(['/chat']);
  }
}
