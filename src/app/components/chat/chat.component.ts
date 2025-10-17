import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OutputComponent } from '../output/output.component';
import { InputComponent } from '../input/input.component';
import { DetailsComponent } from '../details/details.component';

import { ContextService } from '../../services/context.service';
import { MessageService } from '../../services/message.service';
import { SocketService } from '../../services/socket.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-chat',
  imports: [CommonModule, OutputComponent, InputComponent, DetailsComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit, OnDestroy {
  private context = inject(ContextService);
  private messageService = inject(MessageService);
  private socketService = inject(SocketService);
  private authService = inject(AuthService);

  currentChannel = this.context.currentChannel;

  ngOnInit(): void {
    // connect to socket & set up listeners when chat initializes
    this.socketService.connect();
    this.context.setupSocketListeners();
    console.log('Chat component initialized');
  }

  ngOnDestroy(): void {
    // cleanup sockets and disconnect when exiting chat
    this.context.cleanupSocketListeners();
    this.socketService.disconnect();
  }

  // handle message submission from input component
  onMessageSubmit(data: { content: string, attachment?: string }): void {
    const channel = this.currentChannel();
    if (!channel) {
      console.error('No channel selected');
      return;
    }

    console.log('Chat: Sending message to channel:', channel.name, channel._id);
    console.log('Chat: Messagewith data:', data);

    this.messageService.sendMessage(channel._id, data ).subscribe({
      next: (res) => {
        console.log('Chat: Message sent successfully:', res.createdMessage);
        // message will be added to context via socket event
      },
      error: (err) => {
        console.error('Chat: Failed to send message:', err);
        alert('Failed to send message');
      }
    });
  }
}
