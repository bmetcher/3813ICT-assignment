import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { Group } from '../models/group.model';


@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private server = "http://localhost:3000/api";

  // User Management
  getUsers(): Observable<User[]> {  // TO BE REPLACED 
    return this.http.get<User[]>(`${this.server}/data/users`);
  }
  createUser(user: User): Observable<User> {
    return this.http.post<User>(`${this.server}/admin/users`, user);
  }
  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.server}/admin/users/${id}`);
  }

  // Group Management
  getGroups(): Observable<Group[]> {  // TO BE REPLACED (context)
    return this.http.get<Group[]>(`${this.server}/data/groups`);
  }
  createGroup(group: Group): Observable<Group> {
    return this.http.post<Group>(`${this.server}/admin/groups`, group);
  }
  deleteGroup(id: string): Observable<void> {
    return this.http.delete<void>(`${this.server}/admin/groups/${id}`);
  }
}
