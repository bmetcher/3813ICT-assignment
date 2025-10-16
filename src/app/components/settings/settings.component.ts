import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { UtilityService } from '../../services/utility.service';
import { Router } from '@angular/router';
import { User } from '../../models/user.model';
import { environment } from '../../../environments/environment';
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
  readonly utility = inject(UtilityService);
  private router = inject(Router);
  private baseUrl = environment.apiUrl.replace('/api', '');

  editing = signal<boolean>(false);
  errorMsg = signal<string>('');
  saving = signal<boolean>(false);
  uploading = signal<boolean>(false);

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

  // get the full avatar URL
  getAvatarUrl(avatarPath: string | undefined): string {
    return this.utility.getAvatarUrl(avatarPath);
  }

  //
  async onAvatarSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    console.log('File selected:', file.name, file.type, file.size);

    // validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      this.errorMsg.set('Please select a valid image file (JPG, PNG, GIF, WebP)');
      return;
    }

    // validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      this.errorMsg.set('File size must be less than 5MB');
      return;
    }

    const user = this.editableUser();
    if (!user) return;

    this.uploading.set(true);
    this.errorMsg.set('');

    try {
      console.log('Uploading avatar for users:', user._id);

      const result = await firstValueFrom(
        this.userService.uploadAvatar(user._id, file)
      );

      console.log('Avatar uploaded successfully:', result);

      // update local state
      const updatedUser = { ...user, avatar: result.avatarUrl };
      this.editableUser.set(updatedUser);

      // update global auth state
      this.authService.setCurrentUser(result.user);

      // force image reload by adding timestamp (cache busting)
      const img = document.querySelector('img.rounded-circle') as HTMLImageElement;
      if (img) {
        const url = this.getAvatarUrl(result.avatarUrl);
        img.src = `${url}?t=${Date.now()}`;
      }

      alert('Avatar updated successfully!');
    } catch (err: any) {
      console.error('Avatar upload failed:', err);
      this.errorMsg.set(err.error?.error || 'Failed to upload avatar. Please try again.');
    } finally {
      this.uploading.set(false);
      // reset input so same file can be selected again
      input.value = '';
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
