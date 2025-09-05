import { Injectable, signal, inject, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user.model';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

import { Users } from '../user-data'

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // inject angular services
  private http = inject(HttpClient);
  private router = inject(Router);
  private server = "http://localhost:3000"; // hardcoded API server

  // signals (reactive, "primitive" variables)
  private _loggedIn = signal(false);
  private _user = signal<User | null>(null);

  readonly currentUser = computed (() => this._user());
  readonly isLoggedIn = computed(() => this._loggedIn());

  // http post to server -> observable
  login(email: string, pwd: string): Observable<User> {
    // Replace later with HTTP & Server:
    return this.http.post<User>(`${this.server}/api/auth`, { email: email, pwd: pwd });
  }

  setstatus(status: boolean) {
    this._loggedIn.set(status);
  }
  // read user data from local storage
  getCurrentUser(): User | null{
    let json = localStorage.getItem('currentUser');
    return json ? JSON.parse(json) : null;
  }

  // save user data to localstorage
  setCurrentUser(newUser:User | null) {
    this.setstatus(true);
    this._user.set(newUser);
    console.log(this._user());  // DEBUGGING
    localStorage.setItem('currentUser', JSON.stringify(newUser));
  }

  // clear localstorage and redirect to home
  logout() {
    localStorage.removeItem('currentUser');
    this.setstatus(false);
    this._user.set(null);
    this.router.navigateByUrl('/');
  }
}
