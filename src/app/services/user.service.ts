import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model';

const API = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);

  // Get a single user by ID
  getUser(userId: string): Observable<User> {
    return this.http.get<User>(`${API}/users/${userId}`);
  }

  // Update user data
  updateUser(userId: string, data: Partial<User>): Observable<User> {
    return this.http.put<User>(`${API}/users/${userId}`, data);
  }

  // Update user password
  updatePassword(userId: string, oldPassword: string, newPassword: string) {
    return this.http.put(`${API}/users/${userId}/password`, { oldPassword, newPassword });
  }

  // Delete user
  deleteUser(userId: string): Observable<any> {
    return this.http.delete(`${API}/users/${userId}`);
  }

  // Get all users in a group
  getUsersByGroup(groupId: string): Observable<User[]> {
    return this.http.get<User[]>(`${API}/users/group/${groupId}`);
  }

  // Get all users in a channel
  getUsersByChannel(channelId: string): Observable<User[]> {
    return this.http.get<User[]>(`${API}/users/channel/${channelId}`);
  }
}
