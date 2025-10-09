import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { User } from '../../models/user.model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-settings',
  imports: [FormsModule, CommonModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private router = inject(Router);

  editing = signal<boolean>(false);
  errorMsg = signal<string>('');
  saving = signal<boolean>(false);

  // Local editable copy of user signal
  editableUser = signal<User | null>(null);

  constructor() {
    // initialize from AuthService
    const current = this.authService.currentUser();
    if (current) this.editableUser.set({ ...current });
  }


  // Toggle edit mode in settings
  toggleEdit() {
    if (!this.editing()) {
      // start editing: clone current user for editableUser
      const current = this.authService.currentUser();
      if (current) this.editableUser.set({ ...current });
      this.editing.set(true);
    } else {
      // leave edit mode
      const confirmed = window.confirm("Save your changes?");
      if (confirmed) {
        this.saveChanges();
      }
    }
  }


  // Save changes to user edit
  private async saveChanges() {
    const user = this.editableUser();
    if (!user) return;

    this.saving.set(true);
    this.errorMsg.set('');

    try {
      const updated = await firstValueFrom(this.userService.updateUser(user._id, user));
      // update global AuthService signal
      this.authService.setCurrentUser(updated);
      this.editableUser.set({ ...updated });
      this.editing.set(false);
    } catch (err: any) {
      console.error('Save failed', err);
      this.errorMsg.set('Failed to save changes.');
    } finally {
      this.saving.set(false);
    }
  }


  // return to Chat component
  backToChat() {
    this.router.navigateByUrl('/chat');
  }
  // goToAdmin() {
  //   this.router.navigateByUrl('/admin')
  // }


  // Logout helper
  logout() {
    const confirmed = window.confirm("Confirm logging out?");
      if (confirmed) {
        this.authService.logout();
      }
  }
}
