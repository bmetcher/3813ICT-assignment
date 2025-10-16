import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private API = `${environment.apiUrl}/users`;

  // Upload a new avatar for a user
  uploadAvatar(userId: string, file: File): Observable<{ user: User, avatarUrl: string, success: boolean }> {
    const formData = new FormData();
    formData.append('avatar', file);

    return this.http.post<{ user: User, avatarUrl: string, success: boolean }>(
      `${this.API}/${userId}/avatar`,
      formData
    );
  }

  // Update user data
  updateUser(userId: string, data: Partial<User>): Observable<User> {
    return this.http.put<{ updatedUser: User, success: boolean }>(
      `${this.API}/${userId}`,
      data
    ).pipe(map(res => res.updatedUser));
  }

  // Update user password
  updatePassword(userId: string, oldPassword: string, newPassword: string): Observable<{ success: boolean }> {
    return this.http.put<{ success: boolean }>(
      `${this.API}/${userId}/password`,
      { oldPassword, newPassword }
    );
  }

  // Delete user
  deleteUser(userId: string): Observable<{ deletedUser: User, success: boolean }> {
    return this.http.delete<{ deletedUser: User, success: boolean }>(
      `${this.API}/${userId}`
    );
  }

  // Get a single user by ID
  getUser(userId: string): Observable<User> {
    return this.http.get<{ user: User, success: boolean }>(
      `${this.API}/${userId}`
    ).pipe(map(res => res.user));
  }

  // Get all users in a group
  getUsersByGroup(groupId: string): Observable<User[]> {
    return this.http.get<{ users: User[], success: boolean }>(
      `${this.API}/group/${groupId}`
    ).pipe(map(res => res.users));
  }

  // Get all users in a channel
  getUsersByChannel(channelId: string): Observable<User[]> {
    return this.http.get<{ users: User[], success: boolean }>(
      `${this.API}/channel/${channelId}`
    ).pipe(map(res => res.users));
  }
}
