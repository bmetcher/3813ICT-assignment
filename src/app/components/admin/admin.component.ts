import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { ContextService } from '../../services/context.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from '../../models/user.model';
import { Group } from '../../models/group.model';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent {
  private router = inject(Router);
  private context = inject(ContextService);

  // signals with pagination
  currentPageUsers = signal(0);
  pageSize = 10;
  // groups from context
  groups = computed(() => this.context.groups());

  // initialized for creating a new user
  newUser: Partial<User> = {};
  newUserToggle: boolean = false;


  // paginated users from context
  paginatedUsers = computed(() => {
    const start = this.currentPageUsers() * this.pageSize;
    return this.context.users().slice(start, start + this.pageSize);
  });
  totalUserPages = computed(() => {
    return Math.ceil(this.context.users().length / this.pageSize);
  });

  // pagination helpers
  nextPage() {
    if (this.currentPageUsers() + 1 < this.totalUserPages()) {
      this.currentPageUsers.set(this.currentPageUsers() + 1);
    }
  }
  prevPage() {
    if (this.currentPageUsers() > 0) {
      this.currentPageUsers.set(this.currentPageUsers() - 1);
    }
  }

  
  // return to settings
  backToSettings() {
    this.router.navigate(['/settings'])
  }
}
