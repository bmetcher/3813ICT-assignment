import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Message } from '../models/message.model';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private http = inject(HttpClient);
  private API = `${environment.apiUrl}/messages`;

  // Send a new message
  sendMessage(channelId: string, data: { content: string; attachment?: string; replyTo?: string }) {
    return this.http.post<{ createdMessage: Message }>(
      `${this.API}/channel/${channelId}`, 
      data
    );
  }

  // Upload a message attachment
  uploadAttachment(file: File): Observable<{ attachmentUrl: string, success: boolean }>{
    const formData = new FormData();
    formData.append('attachment', file);

    return this.http.post<{ attachmentUrl: string, success: boolean }>(
      `${this.API}/attachment`,
      formData
    );
  }

  // Get messages (with pagination)
  getMessages(channelId: string, limit = 50, before?: string) {
    let url = `${this.API}/channel/${channelId}?limit=${limit}`;
    if (before) url += `&before=${before}`;
    return this.http.get<{ messages: Message[] }>(url);
  }

  // Edit a message
  editMessage(channelId: string, messageId: string, content: string) {
    return this.http.put<{ updatedMessage: Message }>(
      `${this.API}/channel/${channelId}/message/${messageId}`,
      { content } 
    );
  }

  // Delete a message
  deleteMessage(channelId: string, messageId: string) {
    return this.http.delete<{ deletedMessage: Message }>(
      `${this.API}/channel/${channelId}/message/${messageId}`
    );
  }
}
