import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms'; // inject forms module to handle forms properly
import { Router } from '@angular/router';     // (we dont want to re-import ALL angular, just parts)
import { Subscription } from 'rxjs';  // for observables
import { CommonModule } from '@angular/common';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})


// must have ngOnInit()
export class LoginComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);

  private loginsub?: Subscription;

  email:string = "";
  pwd:string = "";
  errormsg = "";


  ngOnInit(): void {
    const user = this.authService.getCurrentUser(); // try get user
    // log out an "expired" user
    if (user && this.authService.isLoggedIn()==false) {
      alert("Session expired. Please log in again.");
      this.authService.logout();
    }
    // redirect to profile page for a logged in user
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/chat']);
    }
  }

  login(event: Event) {
    event.preventDefault();
    this.errormsg = "";

    // subscribe to the authservice observable
    this.loginsub = this.authService.login(this.email, this.pwd).subscribe(
      {
        next: (data: any) => {
          if (data.valid) {
            this.authService.setCurrentUser(data);
            this.router.navigate(['/chat']);
          } else {
            this.errormsg = "Invalid credentials";
          }
        },
        error:(e) => console.log("Some error happened", e),
        complete: () => console.info("Complete")
      });
  }

  // clean up properly
  ngOnDestroy() {
    if(this.loginsub) {
      this.loginsub?.unsubscribe();
    }
  }

}
