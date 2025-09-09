
# 3813ICT Assignment - Phase 1


## Project Overview
Web-based chat application with groups, channels and role-based user permissions.
#### Phase 1 Focus:
* User Creation, Login, and role-based views (super admin | group admin | user)
* Assigning users to groups and channels
* Basic UI skeleton for: Chat, Profile and Admin management
* Frontend-only implementation with 'dummy' data and localStorage (no backend, yet)
* Navigation and component layout for a functional demo



### UI Layout
#### Pages & Components
* Login Page:
  Users can enter their email and password. Logs the user in by storing data in localStorage (No real authentication or encryption in Phase 1)

* Chat Dashboard:
  Display the user's groups and channels. Parent component of:
  * Output: Display messages in the selected channel
  * Input: Send messages (pseudo-functional; later will handle voice control etc.)
  * Details: Show channel members with role-based actions (Group/Super Admin: add or remove users)

* Navbar:
  * Displays groups based on the stored user
  * Toggle groups "open" to show existing channels
  * Select a channel to set as the active channel for the Chat component(s)

* Settings:
  * Update the user's information (username, email, password)
  * Logout button to clear current user from localStorage
  * Admin Settings button for Super Admin

* Admin Settings (Super Admin only): 
  Manage users and groups. Here a super admin can:
  * Create new users
  * Remove existing users
  * Assign users to groups (non-functional)



### Roles & Permissions

|Role        | Permissions (Phase 1)                                                |
|------------|----------------------------------------------------------------------|
|Super Admin | Create/remove users, assign group admins, view all groups & channels |
|Group Admin | Manage channels within groups, invite or remove users to channels    |
|User        | View channels & members, send messages                               |

* Note: Role-based access control is handled using `auth.guard.ts` for logged-in users,
and `super.guard.ts` for super-admin routes.*



### Data Structures
#### Models
##### User `user.model.ts`
```ts
public id: string,
public username: string,
public email: string,
public groups: string[] = [],
public password?: string,   // Phase 1 only; not secure
public avatar?: string,     // URL for user's saved image
public superAdmin: boolean = false,
public valid: boolean = false
```
##### Group `group.model.ts`
```ts
public id: string,
public name: string,
public admins: string[] = [],   // user IDs
public members: string[] = [],  // user IDs
public channels: string[] = [], // channel IDs
public open: boolean
```
##### Channel `channel.model.ts`
```ts
public id: string,
public name: string,
public groupId: string,
public members: string[] = [],  // user IDs
public messages: { userId: string, content: string, timestamp: Date }[] = []
```


### Angular Architecture
#### Components
```
admin
chat
├ details
├ input
└ output
login
navbar
settings
```
#### Guards
```
auth.guard    // makes sure user is logged in
super.guard   // makes sure user is a super admin
```
#### Services
```
auth.service.ts     // handles user login/logout, getting groups, and role-checking`
channel.service.ts  // manages selected channel, messages, and role-checking`
```


### Data Handling & Persistence
* Data is initialized from a local test dataset (`dummy-data.ts`) when localStorage doesn't exist
* All data changes are persisted only in localStorage for demo purposes
* Super admin actions (create/remove users, or groups) modify localStorage; changes can survive temporarily (page refresh, some navigation)
* Channels and messages are stored in signals of `ChannelService` for reactive frontend updates



### Node Server Architecture (Phase 2 Planning)
Currently Phase 1 is frontend-only, but the intended architecture will include a Node.js backend for persistent data storage.
```
/server
└ server.js
```
#### Planned Routes:
```
POST /login
GET /users
GET /groups
GET /channels/:groupId
```


### Version Control
* Git repository structured to separate: assets, components, services, guards, and models.
* Frequent commits made with descriptive messages, e.g.:
```
added: components, models, routes
added: admin component & superGuard
+details: admin can remove or add users (temp)
```


### Notes Going Forward
#### Must Implement:
* Replace localStorage with a backend database (MongoDB) - many features, incl. image upload
* Node.js - proper REST API endpoints
* Secure authentication with B-crypt
* Sockets - proper chat functionality
* PeerJS - video chat

#### Would Like to Implement:
* Revise data structures:
  * Groups & Channels - relating to their respective admins and users
  * Messages
* Enhance UI: all super admin & group admin permissions secure & tidy 


