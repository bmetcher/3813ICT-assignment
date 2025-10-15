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
    // connect to socket when component initializes
    this.socketService.connect();
    console.log('Chat component initialized');
  }

  ngOnDestroy(): void {
    // disconnect socket when leaving chat
    this.socketService.disconnect();
  }

  // handle message submission from input component
  onMessageSubmit(content: string): void {
    const channel = this.currentChannel();
    if (!channel) {
      console.error('No channel selected');
      return;
    }

    this.messageService.sendMessage(channel._id, { content }).subscribe({
      next: (res) => {
        console.log('Message sent:', res.createdMessage);
        // message will be added to context via socket event
      },
      error: (err) => {
        console.error('Failed to send message:', err);
        alert('Failed to send message');
      }
    });
  }
}
