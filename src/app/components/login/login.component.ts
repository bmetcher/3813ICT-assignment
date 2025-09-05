import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms'; // handle forms properly
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

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
  private loginSub?: Subscription;

  email: string = "";
  password: string = "";
  errorMsg = "";

  ngOnInit(): void {
    const user = this.authService.getCurrentUser(); // try to get user
    // log out an "expired" user
    if (user && this.authService.isLoggedIn() == false) {
      alert("Session expired! Please log in again.");
      this.authService.logout();
    }
    // redirect to chat for a logged in user
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/chat']);
    }
  }

  // Attempt User Login
  login(event: Event) {
    event.preventDefault();
    this.errorMsg = "";

    // subscribe to the authService observable
    this.loginSub = this.authService.login(this.email, this.password).subscribe(
      {
        next: (data: any) => {
          if (data.valid) {
            this.authService.setCurrentUser(data);
            this.router.navigate(['/chat']);
          } else {
            this.errorMsg = "Invalid Credentials";
          }
        },
        error: (e) => console.log("Some error occurred", e),
        complete: () => console.info("Complete!")
      });
  }

  // Clean-up
  ngOnDestroy() {
    if (this.loginSub) {
      this.loginSub?.unsubscribe();
    }
  }
}
