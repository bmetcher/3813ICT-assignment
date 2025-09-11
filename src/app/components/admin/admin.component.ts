import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Users, Groups, GuestUser } from '../../dummy-data';
import { User } from '../../models/user.model';
import { Group } from '../../models/group.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {
  private router = inject(Router);
  private adminService = inject(AdminService);

  users: User[] = [];
  groups: Group[] = [];

  newUser: User = GuestUser;
  newUserToggle: boolean = false;

  newGroup: Group = { id: '', name: '', admins: ['1'], members: ['1'], channels: [], open: false };
  newGroupToggle: boolean = false;

  ngOnInit() {
    // subscribe to 'users' & 'groups' observables using 'admin.service'
    this.adminService.getUsers().subscribe(users => this.users = users);
    this.adminService.getGroups().subscribe(groups => this.groups = groups);
  }

  // Add or Remove Groups
  createGroup() {
    // show the form
    if (!this.newGroupToggle) {
      this.newGroup.name = '';
      this.newGroupToggle = true;
      return;
    }
    
    // confirm creation
    const confirmed = window.confirm("Create new group?");
    if (!confirmed) return;

    this.adminService.createGroup(this.newGroup).subscribe({
      next: (group) => {
        this.groups.push(group);
        this.newGroup.name = '';
        this.newGroupToggle = false;
        alert('Group created successfully');
      },
      error: (err) => {
        alert(err.error?.error || 'Failed to create group');
      }
    });
  }
  removeGroup(groupX: Group) {
    // ask for confirmation
    const confirmed = window.confirm("Delete group " + groupX.name + " ?");
    if (!confirmed) return;

    // send DELETE request for the group
    this.adminService.deleteGroup(groupX.id).subscribe({
      next: () => {
        this.groups = this.groups.filter(group => group.id !== groupX.id);
        alert("Group removed");
      },
      error: (err) => {
        alert(err.error?.error || "Failed to remove user");
      }
    });
  }


  // Add or Remove Users
  createUser() {
    // show the form
    if (!this.newUserToggle) {
      this.newUserToggle = true;
      return;
    }
    
    // confirm creation
    const confirmed = window.confirm("Create new user?");
    if (!confirmed) return;

    this.adminService.createUser(this.newUser).subscribe({
      next: (user) => {
        this.users.push(user);
        this.newUser = { ...GuestUser };  // reset form
        this.newUserToggle = false;
        alert('User created successfully');
      },
      error: (err) => {
        alert(err.error?.error || 'Failed to create user');
      }
    });
  }
  removeUser(userX: User) {
    // ask for confirmation
    const confirmed = window.confirm("Delete user " + userX.username + " ?");
    if (!confirmed) return;

    // send DELETE request for the user
    this.adminService.deleteUser(userX.id).subscribe({
      next: () => {
        this.users = this.users.filter(user => user.id !== userX.id);
        alert("User removed")
      },
      error: (err) => {
        alert(err.error?.error || "Failed to remove user");
      }
    });
  }

  // (placeholder) * move to Details component later
  addToGroup() {

  }

  // return to settings
  backToSettings() {
    this.router.navigate(['/settings'])
  }
}
