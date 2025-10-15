import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
  getGroups(userId: string): Observable<{ groups: Group[], success: boolean }> {
    return this.http.get<{ groups: Group[], success: boolean }>(
      `${this.API}/${userId}`
    );
  }

  // Create a new group
  createGroup(group: Partial<Group>): Observable<{ createdGroup: Group, success: boolean }> {
    return this.http.post<{ createdGroup: Group, success: boolean }>(
      this.API, 
      { group }
    );
  }

  // Update a group's name or image
  updateGroup(groupId: string, update: Partial<Group>): Observable<{ group: Group, success: boolean }> {
    return this.http.put<{ group: Group, success: boolean }>(
      `${this.API}/${groupId}`, 
      update
    );
  }

  // Delete a group
  deleteGroup(groupId: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(
      `${this.API}/${groupId}`
    );
  }

  // Invite a user to a group
  inviteUser(groupId: string, userId: string): Observable<{ success: boolean }> {
    return this.http.put<{ success: boolean }>(
      `${this.API}/${groupId}/${userId}/invite`, 
      {}
    );
  }

  // Add/revoke group admin for a user
  updateGroupRole(groupId: string, userId: string, newRole: "user" | "admin"): Observable<{ updatedMembership: any, success: boolean }> {
    return this.http.put<{ updatedMembership: Membership, success: boolean }>(
      `${this.API}/${groupId}/${userId}`, 
      { newRole }
    );
  }
}
