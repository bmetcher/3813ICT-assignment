import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Ban } from '../models/ban.model';

@Injectable({
  providedIn: 'root'
})
export class BansService {
  private http = inject(HttpClient);
  private API = `${environment.apiUrl}/bans`;

  // Create ban
  createBan(groupId: string, userId: string, data: { reason?: string; duration: number }, channelId?: string) {
    const url = channelId
      ? `${this.API}/group/${groupId}/channel/${channelId}/user/${userId}`
      : `${this.API}/group/${groupId}/user/${userId}`;
    return this.http.post<{ ban: Ban }>(url, data);
  }

  // Get bans by: group, channel, user (active-only, or all)
  getBans(groupId: string, channelId?: string, userId?: string, all?: boolean) {
    let url = `${this.API}/group/${groupId}`;
    // build the target endpoint URL from the provided parameters
    if (channelId) url += `/channel/${channelId}`;
    if (userId) url += `/user/${userId}`;
    url += all ? '/all' : '/active';
    return this.http.get<{ bans: Ban[] }>(url);
  }

  // Edit the duration or reason of an existing ban
  editBan(banId: string, data: { reason?: string; duration?: number }) {
    return this.http.put<{ updatedBan: Ban }>(
      `${this.API}/${banId}`,
      data
    );
  }

  // Delete a ban
  deleteBan(banId: string) {
    return this.http.delete<{ deletedBan: Ban }>(`${this.API}/${banId}`);
  }
}
