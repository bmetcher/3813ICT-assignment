import { Component, Output, EventEmitter, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MessageService } from '../../services/message.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-input',
  imports: [FormsModule, CommonModule],
  templateUrl: './input.component.html',
  styleUrl: './input.component.css'
})
export class InputComponent {
  @Output() messageSubmit = new EventEmitter<{ content: string, attachment?: string }>();

  private messageService = inject(MessageService);
  private baseUrl = environment.apiUrl.replace('/api', '');

  messageContent = signal<string>('');
  selectedFile = signal<File | null>(null);
  previewUrl = signal<string | null>(null);
  uploading = signal<boolean>(false);

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    // validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Please select a valid image file (JPG, PNG, GIF, WebP)');
      return;
    }

    // validate file size (8MB)
    const maxSize = 8 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('File size must be less than 10MB');
      return;
    }

    this.selectedFile.set(file);

    // create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewUrl.set(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  removeAttachment() {
    this.selectedFile.set(null);
    this.previewUrl.set(null);
    // reset file input
    const fileInput = document.getElementById('attachment-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  async sendMessage() {
    const content = this.messageContent().trim();
    const file = this.selectedFile();

    if (!content && !file) return;

    let attachmentUrl: string | undefined;

    // upload attachment if present
    if (file) {
      this.uploading.set(true);
      try {
        const result = await this.messageService.uploadAttachment(file).toPromise();
        attachmentUrl = result?.attachmentUrl;
      } catch (err) {
        console.error('Failed to upload attachment:', err);
        alert('Failed to upload image');
        this.uploading.set(false);
        return;
      }
      this.uploading.set(false);
    }

    // emit message
    this.messageSubmit.emit({
      content: content || '',
      attachment: attachmentUrl
    });

    // clear inputs
    this.messageContent.set('');
    this.removeAttachment();
  }
}
