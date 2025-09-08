import { Component, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-input',
  imports: [FormsModule],
  templateUrl: './input.component.html',
  styleUrl: './input.component.css'
})
export class InputComponent {
  newMessage: string = '';
  
  @Output() messageSubmit = new EventEmitter<string>();

  addMessage() {
    if (this.newMessage.trim()) {
      this.messageSubmit.emit(this.newMessage);
      this.newMessage = '';
    }
  }
}
