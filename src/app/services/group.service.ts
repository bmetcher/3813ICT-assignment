import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Group } from '../models/group.model';
import { Membership } from '../models/membership.model';

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  private http = inject(HttpClient);
  private API = `${environment.apiUrl}/groups`;

  // Get all groups for a user
  getGroups(userId: string) {
    return this.http.get<{ groups: Group[] }>(
      `${this.API}/${userId}`
    );
  }

  // Create a new group
  createGroup(group: Partial<Group>) {
    return this.http.post<{ group: Group }>(
      this.API, 
      { group }
    );
  }

  // Update a group's name or image
  updateGroup(groupId: string, update: Partial<Group>) {
    return this.http.put<{ group: Group }>(
      `${this.API}/${groupId}`, 
      update
    );
  }

  // Add/revoke group admin for a user
  updateGroupRole(groupId: string, userId: string, newRole: "user" | "admin") {
    return this.http.put<{ updatedMembership: Membership }>(
      `${this.API}/${groupId}/${userId}`, 
      { newRole }
    );
  }

  // Invite a user to a group
  inviteUser(groupId: string, userId: string) {
    return this.http.put<{ success: boolean }>(
      `${this.API}/${groupId}/${userId}/invite`, 
      {}
    );
  }

  // Delete a group
  deleteGroup(groupId: string) {
    return this.http.delete<{ success: boolean }>(
      `${this.API}/${groupId}`
    );
  }
}
