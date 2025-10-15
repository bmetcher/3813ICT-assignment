import { Component, OnInit, OnDestroy, Input, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ContextService } from '../../services/context.service';
import { MessageService } from '../../services/message.service';
import { SocketService } from '../../services/socket.service';
import { UserService } from '../../services/user.service';
import { Message } from '../../models/message.model';

@Component({
  selector: 'app-output',
  imports: [CommonModule],
  templateUrl: './output.component.html',
  styleUrl: './output.component.css'
})
export class OutputComponent implements OnInit {
  @Input() channelId!: string;
  
  private messageService = inject(MessageService);
  private socketService = inject(SocketService);
  private userService = inject(UserService);
  private context = inject(ContextService);

  // reactive signals from ContextService
  messages = this.context.messages;
  users = this.context.users;

  
  constructor() {
    // watch for channel changes and reload data
    effect(() => {
      const channel = this.context.currentChannel();
      if (channel) {
        this.loadChannelData(channel._id);
      } else {
        this.context.clearMessages();
        this.context.setUsers([]);
      }
    });
  }

  ngOnInit(): void {
    // set up socket listeners
    this.socketService.on('messageCreated', (msg: Message) => {
      // only add if it's for the current channel
      if (msg.channelId === this.channelId) {
        this.context.addMessage(msg);
      }
    });

    this.socketService.on('messageUpdated', (msg: Message) => {
      if (msg.channelId === this.channelId) {
        const messages = this.context.messages();
        const updated = messages.map(m => m._id === msg._id ? msg : m);
        this.context.setMessages(updated);
      }
    });

    this.socketService.on('messageDeleted', (msg: Message) => {
      if (msg.channelId === this.channelId) {
        this.context.removeMessage(msg._id);
      }
    });
  }

  ngOnDestroy(): void {
    // clean up listeners
    this.socketService.socket?.off('messageCreated');
    this.socketService.socket?.off('messageUpdated');
    this.socketService.socket?.off('messageDeleted');
  }

  private loadChannelData(channelId: string): void {
    // load messages
    this.messageService.getMessages(channelId).subscribe({
      next: (res) => {
        this.context.setMessages(res.messages);
      },
      error: (err) => console.error('Failed to load messages:', err)
    });

    // load users
    this.userService.getUsersByChannel(channelId).subscribe({
      next: (users) => {
        this.context.setUsers(users);
      },
      error: (err) => console.error('Failed to load users:', err)
    });

    // join the socket room for this channel
    this.socketService.emit('joinChannel', channelId);
  }

  // Helper to get username from userId
  getUsername(userId: string): string {
    return this.context.users().find(user => user._id === userId)?.username || 'Unknown';
  }
  // Helper to get avatar URL from userId
  getUserAvatar(userId: string): string {
    return this.context.users().find(user => user._id === userId)?.avatar || 'assets/default-avatar.png';
  }
}
