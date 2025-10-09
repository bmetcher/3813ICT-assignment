import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms'; // handle forms properly
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  // form signals
  email = signal('');
  password = signal('');
  errorMsg = signal('');

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

    try {
      const data = await firstValueFrom(
        this.authService.login(this.email(), this.password())
      );

      // backend returns { token, userId }
      if (data?.token && data?.userId) {
        this.authService.setCurrentUser({ _id: data.userId, email: this.email() } as any);
        this.router.navigate(['/chat']);
      } else {
        this.errorMsg.set('Invalid Credentials');
      }
    } catch (err: any) {
      console.error('Login error', err);
      this.errorMsg.set('Login failed. Try again.');
    }
  }
}
