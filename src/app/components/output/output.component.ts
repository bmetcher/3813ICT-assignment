import { Component, OnInit, OnDestroy, Input, inject, effect, ViewChild, ElementRef, AfterViewChecked, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UtilityService } from '../../services/utility.service';
import { ContextService } from '../../services/context.service';
import { MessageService } from '../../services/message.service';
import { SocketService } from '../../services/socket.service';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { Message } from '../../models/message.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-output',
  imports: [CommonModule],
  templateUrl: './output.component.html',
  styleUrl: './output.component.css'
})
export class OutputComponent implements OnInit, OnDestroy, AfterViewChecked {
  @Input() channelId!: string;

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  private shouldScrollToBottom = true;
  private baseUrl = environment.apiUrl.replace('/api', '');

  private utilityService = inject(UtilityService);
  private messageService = inject(MessageService);
  private socketService = inject(SocketService);
  private authService = inject(AuthService);
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

  // handles automatically viewing bottom of channel messages
  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
    }
  }

  onScroll() {
    const container = this.messagesContainer.nativeElement;
    const threshold = 50;
    const position = container.scrollTop + container.clientHeight;
    const height = container.scrollHeight;

    // check if user is near the bottom
    this.shouldScrollToBottom = (height - position) < threshold;
  }

  private scrollToBottom() {
    try {
      const container = this.messagesContainer.nativeElement;
      container.scrollTop = container.scrollHeight;
    } catch (err) {
      console.error('Scroll error:', err);
    }
  }

  getAttachmentUrl(attachmentPath: string | undefined): string {
    if (!attachmentPath) return '';
    return `${this.baseUrl}/${attachmentPath}`;
  }

  openImageModal(attachmentPath: string) {
    // open image in new tab
    window.open(this.getAttachmentUrl(attachmentPath), '_blank');
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

  // Check if message belongs to the current user
  isOwnMessage(message: Message): boolean {
    return message.userId === this.authService.currentUser()?._id;
  }

  // Edit message
  editMessage(message: Message) {
    const newContent = prompt('Edit message:', message.content);
    if (newContent && newContent.trim() && newContent !== message.content) {
      this.messageService.editMessage(message.channelId, message._id, newContent.trim())
        .subscribe({
          next: () => console.log('Message updated'),
          error: (err) => {
            console.error('Failed to update message:', err);
            alert('Failed to update message');
          }
        });
    }
  }
  
  // Delete message
  deleteMessage(message: Message) {
    if (confirm(`Delete this message?`)) {
      this.messageService.deleteMessage(message.channelId, message._id)
        .subscribe({
          next: () => console.log('Message deleted'),
          error: (err) => {
            console.error('Failed to delete message:', err);
            alert('Failed to delete message');
          }
        });
    }
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

  // group consecutive user messages together
  groupedMessages = computed(() => {
    const messages = this.messages();
    const grouped: any[] = [];

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      const prevMsg = i > 0 ? messages[i - 1] : null;

      const isSameUser = prevMsg && prevMsg.userId === msg.userId;
      const timeDiff = prevMsg
        ? (new Date(msg.timestamp).getTime() - new Date(prevMsg.timestamp).getTime())
        : 999;

      grouped.push({
        ...msg,
        showHeader: !isSameUser || timeDiff > 10
      });
    }

    return grouped;
  });
}
