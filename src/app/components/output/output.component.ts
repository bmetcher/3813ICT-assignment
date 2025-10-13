import { Component, OnInit, Input, inject, effect } from '@angular/core';
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

  ngOnInit(): void {
    if (!this.channelId) return;

    // Load initial messages
    this.messageService.getMessages(this.channelId).subscribe(res => {
      this.context.setMessages(res.messages);
    });

    // Load users for this channel
    this.userService.getUsersByChannel(this.channelId).subscribe(users => {
      this.context.setUsers(users);
    });

    // Listen for new incoming messages
    this.socketService.on(`message:${this.channelId}`, (msg: Message) => {
      this.context.addMessage(msg);
    });

    // Clean up when switching channels automatically
    effect(() => {
      const channel = this.context.currentChannel();
      if (!channel || channel._id !== this.channelId) {
        this.context.clearMessages();
      }
    });
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
