import { Injectable, signal, inject, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';

import { User } from '../models/user.model';
import { Group } from '../models/group.model';
import { Channel } from '../models/channel.model';

import { Users } from '../dummy-data';
import { GuestUser } from '../dummy-data';
import { Groups } from '../dummy-data';
import { Channels } from '../dummy-data';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // inject angular services (LATER)
  private http = inject(HttpClient);
  private router = inject(Router);
  private server = "http://localhost:3000"; // hardcoded API server

  // signals (reactive variables)
  private _loggedIn = signal(false);
  private _user = signal<User | null>(null);
  // If not logged in: return GuestUser
  readonly currentUser = computed(() => this._user() ?? GuestUser);
  readonly isLoggedIn = computed(() => this._loggedIn());

  // Temporary Group & Channel signals for Phase 1
  private _groups = signal<Group[]>([]);
  readonly groups = computed(() => this._groups());



  // Login using hard-coded user data 
  login(email: string, password: string): Observable<User> {
    return this.http.post<User>(`${this.server}/api/auth/login`, { email: email, password: password });
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

    // set groups which contain the user's id
    if (newUser) {
      const userGroups = Groups.filter(group => group.members.includes(newUser.id));
      this._groups.set(userGroups);
    } else {
      this._groups.set([]);
    }

    console.log(this._user());  // debugging
    localStorage.setItem('currentUser', JSON.stringify(newUser));
  }

  // ** REPLACE WITH "CONTEXT"
  // && "contextSubject" for storing relevant users?/channels/groups
  
  // helper function to return relevant channels for a group
  channelsForGroup(groupId: string) {
    return Channels.filter(channel => channel.groupId == groupId);
  }

  // REPLACE THIS IN BACK END WITH CONTEXT
  // if a user is super admin -> boolean
  isSuperAdmin(): boolean {
    const user = this.getCurrentUser();
    if (!user) {
      return false;
    }
    return user.superAdmin === true;
  }


  // clear localStorage and redirect to home
  logout() {
    localStorage.removeItem('currentUser');
    this.setStatus(false);
    this._user.set(null);
    this.router.navigateByUrl('/'); 
  }
}
