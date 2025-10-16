import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms'; // handle forms properly
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ContextService } from '../../services/context.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private authService = inject(AuthService);
  private contextService = inject(ContextService);
  private userService = inject(UserService);
  private router = inject(Router);

  // form signals
  email = signal('');
  password = signal('');
  errorMsg = signal('');
  isLoading = signal(false);

  constructor() {
    const user = this.authService.getCurrentUser();

    if (user && !this.authService.isLoggedIn()) {
      alert("Session expired! Please log in again.");
      this.authService.logout();
    }
    
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/chat']);
    }
  }

  async login(event: Event) {
    event.preventDefault();
    this.errorMsg.set('');
    this.isLoading.set(true);

    try {
      const data = await firstValueFrom(
        this.authService.login(this.email(), this.password())
      );

      // wrong credentials
      if (!data?.token || !data?.userId) {
        this.errorMsg.set('Invalid Credentials');
        this.isLoading.set(false);
        return;
      }

      console.log('Login successful, loading user data..');
      // fetch full user and store in auth (local storage)
      const fullUser = await firstValueFrom(
        this.userService.getUser(data.userId)
      );
      this.authService.setCurrentUser(fullUser);
      
      // load all user context (groups, channels..)
      await this.contextService.loadUserContext(data.userId);

      // navigate to chat
      console.log('Navigating to chat..');
      this.router.navigate(['/chat']);
    } catch (err: any) {
      console.error('Login error:', err);
      this.errorMsg.set('Login failed, try again');
    } finally {
      this.isLoading.set(false);
    }
  }
}
