import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OutputComponent } from '../output/output.component';
import { InputComponent } from '../input/input.component';
import { DetailsComponent } from '../details/details.component';

@Component({
  selector: 'app-chat',
  imports: [CommonModule, OutputComponent, InputComponent, DetailsComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent {
}
