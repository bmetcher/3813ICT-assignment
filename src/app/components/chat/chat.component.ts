import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OutputComponent } from '../output/output.component';
import { InputComponent } from '../input/input.component';
import { DetailsComponent } from '../details/details.component';

import { Channel } from '../../models/channel.model';
import { ChannelService } from '../../services/channel.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-chat',
  imports: [CommonModule, OutputComponent, InputComponent, DetailsComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent {
  private channelService = inject(ChannelService);
  private authService = inject(AuthService);

  // reactive getters from channel.service
  currentChannel = this.channelService.currentChannel;
  messages = this.channelService.messages;

  //when input.component emits a message
  addMessage(content: string) {
    const user = this.authService.currentUser();
    if (!user || !user.id) return;  // safeguard for Guest

    this.channelService.addMessage({
      userId: user.id,
      content,
      timestamp: new Date()
    });
  }
}
