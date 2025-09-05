import { Injectable, signal, inject, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';

import { User } from '../models/user.model';
import { Users } from '../user-data'

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // inject angular services
  private http = inject(HttpClient);
  private router = inject(Router);
  private server = "http://localhost:3000"; // hardcoded API server (?)

  // signals (reactive variables)
  private _loggedIn = signal(false);
  private _user = signal<User | null>(null);

  readonly currentUser = computed(() => this._user());
  readonly isLoggedIn = computed(() => this._loggedIn());


  // Login using hard-coded user data   (*replace later with server-request)
  login(email: string, password: string): Observable<User> {
    // look for any login matches
    const match = Users.find(user => user.email == email && user.password == password);

    // successful login: clear password & valid=true
    if (match) {
      const user: User = { ...match, password: '', valid: true }
      return of(user);  // wrap as an observable
    } else {
      // false login: clear everything
      return of({
        id: '', username: '', email, groups: [], password: '', avatar: '', superAdmin: false, valid: false
      });
    }
  }

  setStatus(status: boolean) {
    this._loggedIn.set(status);
  }

  // Read user data from localStorage
  getCurrentUser(): User | null {
    let json = localStorage.getItem('currentUser');
    return json ? JSON.parse(json) : null;
  }

  // Save user data to localStorage
  setCurrentUser(newUser: User | null) {
    this.setStatus(true);
    this._user.set(newUser);
    console.log(this._user());  // debugging
    localStorage.setItem('currentUser', JSON.stringify(newUser));
  }

  // clear localStorage and redirect to home
  logout() {
    localStorage.removeItem('currentUser');
    this.setStatus(false);
    this._user.set(null);
    this.router.navigateByUrl('/login');
  }
}
