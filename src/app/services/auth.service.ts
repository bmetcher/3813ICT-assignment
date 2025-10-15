import { Injectable, signal, inject, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, tap } from 'rxjs';

import { environment } from '../../environments/environment';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private API = `${environment.apiUrl}`;
  // localStorage keys
  private tokenKey = 'chat_token';
  private userIdKey = 'chat_userId';

  // reactive subjects to track auth state
  public token$ = new BehaviorSubject<string | null>(localStorage.getItem(this.tokenKey));
  public userId$ = new BehaviorSubject<string | null>(localStorage.getItem(this.userIdKey));

  // inject angular services
  private http = inject(HttpClient);
  private router = inject(Router);

  // reactive signals
  private _loggedIn = signal(false);          // is the user logged in
  private _user = signal<User | null>(null);  // current user object

  // computed signals
  readonly currentUser = computed(() => this._user());
  readonly isLoggedIn = computed(() => this._loggedIn());

  // Login: send credentials to backend -> store token and userId
  login(email: string, password: string) {
    return this.http.post<{ token: string; userId: string }>(`${this.API}/login`, { email, password })
      .pipe(tap(res => {
        localStorage.setItem(this.tokenKey, res.token);
        localStorage.setItem(this.userIdKey, res.userId);
        this.token$.next(res.token);
        this.userId$.next(res.userId);
      }));
  }

  // Logout: clear auth state and redirect to home
  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userIdKey);
    this.token$.next(null);
    this.userId$.next(null);

    this.setStatus(false);
    this.router.navigateByUrl('/');
  }

  // Update logged-in status signal
  setStatus(status: boolean) {
    this._loggedIn.set(status);
  }

  // Get current user from localStorage
  getCurrentUser(): User | null {
    let json = localStorage.getItem('currentUser');
    return json ? JSON.parse(json) : null;
  }

  // Save current user to localStorage and update the reactive signal
  setCurrentUser(user: User | null) {
    this._user.set(user);
    this.setStatus(!!user); // true if user, false if null
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user))
    } else {
      localStorage.removeItem('currentUser');
    };
  }
}