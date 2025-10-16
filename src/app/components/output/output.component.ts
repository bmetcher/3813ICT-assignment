import { Component, OnInit, OnDestroy, Input, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UtilityService } from '../../services/utility.service';
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
export class OutputComponent implements OnInit, OnDestroy {
  @Input() channelId!: string;
  
  private utilityService = inject(UtilityService);
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
      console.log('Output: Current channel changed to:', channel?.name);

      if (channel) {
        // clean up old listeners
        this.socketService.socket?.off('messageCreated');
        this.socketService.socket?.off('messageUpdated');
        this.socketService.socket?.off('messageDeleted');
        // load new channel data
        this.loadChannelData(channel._id);
        // set up listeners for this channel
        this.setupSocketListeners(channel._id);
      } else {
        this.context.clearMessages();
        this.context.setUsers([]);
      }
    });
  }

  ngOnInit(): void {
    console.log('Output component intialized');
  }

  ngOnDestroy(): void {
    console.log('Output: Cleaning up socket listeners');
    // clean up listeners
    this.socketService.socket?.off('messageCreated');
    this.socketService.socket?.off('messageUpdated');
    this.socketService.socket?.off('messageDeleted');
  }

  // Set up socket listeners
  private setupSocketListeners(channelId: string): void {
    console.log('Output: Setting up socket listeners for channel:', channelId);

    this.socketService.on('messageCreated', (msg: Message) => {
      console.log('Output: Received messageCreated:', msg);
      // only add if it's for the current channel
      if (msg.channelId === this.channelId) {
        console.log('Output: Adding message to context');
        this.context.addMessage(msg);
      }
    });

    this.socketService.on('messageUpdated', (msg: Message) => {
      console.log('Output: Received messageUpdated:', msg);
      if (msg.channelId.toString() === this.channelId) {
        const messages = this.context.messages();
        const updated = messages.map(m => m._id === msg._id ? msg : m);
        this.context.setMessages(updated);
      }
    });

    this.socketService.on('messageDeleted', (msg: Message) => {
      console.log('Output: Received messageDeleted:', msg);
      if (msg.channelId === this.channelId) {
        this.context.removeMessage(msg._id);
      }
    });
  }

  private loadChannelData(channelId: string): void {
    console.log('Output: Loading data for channel:', channelId);

    // load messages
    this.messageService.getMessages(channelId).subscribe({
      next: (res) => {
        console.log('Output: Loaded messages:', res.messages.length);
        this.context.setMessages(res.messages);

        // extract unique user Ids from messages
        const messageUserIds = [...new Set(res.messages.map(m => m.userId.toString()))];
        console.log('Output: Message authors:', messageUserIds);

        // load users for the channel
        this.loadUsersForChannel(channelId, messageUserIds);
      },
      error: (err) => console.error('Failed to load messages:', err)
    });

    // join the socket room for this channel
    this.socketService.emit('joinChannel', channelId);
  }

  private loadUsersForChannel(channelId: string, messageUserIds: string[]): void {
    this.userService.getUsersByChannel(channelId).subscribe({
      next: (users) => {
        console.log('Output: Loaded channel users:', users.length, users);

        // check if all message authors are in the user list
        const userIds = users.map(user => user._id.toString());
        const missingUserIds = messageUserIds.filter(id => !userIds.includes(id));

        if (missingUserIds.length > 0) {
          console.warn('Output: some message authors are not actually in the channel users:', missingUserIds);
          // TODO: handle displaying messages of users who aren't in the channel anymore
        }

        this.context.setUsers(users);
      },
      error: (err) => console.error('Failed to load users:', err)
    });
  }

  // Helper to get username from userId
  getUsername(userId: string): string {
    const user = this.context.users().find(user => user._id === userId);

    if (user) return user.username;
    // TODO: Check if user has been Banned, Deleted, or Left the channel/group
    return '[Removed User]';
  }

  // Helper to get avatar URL from userId through utility service
  getUserAvatar(userId: string): string {
    const user = this.context.users().find(user => user._id === userId);
    return this.utilityService.getAvatarUrl(user?.avatar);
  }
}
