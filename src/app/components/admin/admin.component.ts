import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Users, Groups, GuestUser } from '../../dummy-data';
import { User } from '../../models/user.model';
import { Group } from '../../models/group.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {
  private router = inject(Router);

  users: User[] = [];
  groups: Group[] = [];

  newUser: User = GuestUser;
  newUserToggle: boolean = false;

  newGroup: Group = { id: '', name: '', admins: ['1'], members: ['1'], channels: [], open: false };
  newGroupToggle: boolean = false;

  ngOnInit() {
    // load users from localStorage if it exists (temporary)
    const savedUsers = localStorage.getItem('users');
    const savedGroups = localStorage.getItem('groups');

    // without saved users; we load the dummy-data (temporary)
    if (!savedUsers || savedUsers == '[]') {
      this.users = [...Users];  
      localStorage.setItem('users', JSON.stringify(this.users));
    } else {
      this.users = JSON.parse(savedUsers);
    }
    // without saved groups; we load the dummy-data (temporary)
    if (!savedGroups || savedGroups == '[]') {
      this.groups = [...Groups];  
      localStorage.setItem('groups', JSON.stringify(this.groups));
    } else {
      this.groups = JSON.parse(savedGroups);
    }
  }



  // Add or Remove Groups
  createGroup() {
    // show the form
    if (!this.newGroupToggle) {
      this.newGroup.name = '';
      this.newGroupToggle = true;
      return;
    }
    
    // check if the group already exists
    if(this.groups.some(group => group.name == this.newGroup.name)) {
      alert("That group name is already taken!");
      return;
    }
    // confirm creation
    const confirmed = window.confirm("Create new group?");
    if (!confirmed) return;

    // assign new ID
    const newId = (this.groups.length + 1).toString();
    // create a copy of the newGroup object
    const groupToAdd: Group = { ...this.newGroup, id: newId };

    // add user to list
    this.groups.push(groupToAdd);
    // persist to localStorage (temporary)
    localStorage.setItem('groups', JSON.stringify(this.groups));

    // reset form
    this.newGroup.name = '';
    this.newGroupToggle = false;
  }
  removeGroup(groupX: Group) {
    // ask for confirmation
    const confirmed = window.confirm("Delete group " + groupX.name + " ?");
    if (!confirmed) return;

    // remove specific group from the array
    this.groups = this.groups.filter(group => group.id !== groupX.id);
    localStorage.setItem('groups', JSON.stringify(this.groups));

    alert("Group removed")
  }


  // Add or Remove Users
  createUser() {
    // show the form
    if (!this.newUserToggle) {
      this.newUser.username = '';
      this.newUserToggle = true;
      return;
    }
    
    // check if the username already exists
    if(this.users.some(user => user.username == this.newUser.username)) {
      alert("That username is already taken!");
      return;
    }
    // confirm creation
    const confirmed = window.confirm("Create new user?");
    if (!confirmed) return;

    // assign new ID
    const newId = (this.users.length + 1).toString();
    // create a copy of the newUser object
    const userToAdd: User = { ...this.newUser, id: newId };

    // add user to list
    this.users.push(userToAdd);
    // persist to localStorage (temporary)
    localStorage.setItem('users', JSON.stringify(this.users));

    // reset form
    this.newUser = { ...GuestUser };
    this.newUserToggle = false;
  }
  removeUser(userX: User) {
    // ask for confirmation
    const confirmed = window.confirm("Delete user " + userX.username + " ?");
    if (!confirmed) return;

    // remove specific user from the array
    this.users = this.users.filter(user => user.id !== userX.id);
    localStorage.setItem('users', JSON.stringify(this.users));

    alert("User removed")
  }

  // (placeholder) * move to Details component later
  addToGroup() {

  }

  // return to settings
  backToSettings() {
    this.router.navigate(['/settings'])
  }
}
