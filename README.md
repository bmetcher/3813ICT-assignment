
# [3813ICT Assignment - Phase 2](https://github.com/bmetcher/3813ICT-assignment/)

## Project Overview
Web-based chat application with groups, channels and role-based user permissions.
#### Phase 2 Focus:
* MongoDB (CRUD)
* Sockets.io for ASYNC Chat Operations
* Video and Image Chat
* "Polished UI"


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
##### Group `group.model.ts`
```ts
public _id: string,
public name: string,
public channels: string[] = [],
public admins: string[] = [],
public bannedUsers: string[] = [],
public open?: boolean
```
##### Channel `channel.model.ts`
```ts
public _id: string,
public groupId: string,
public name: string,
public description: string,
public bannedUsers: string[] = []
```
##### User `user.model.ts`
```ts
  public _id: string,
  public username: string,
  public groups: string[] = [],   // temporary; may change localStorage caching later.
  public channels: string[] = [],
  
  public avatar: string,          // URL for user's saved image
  public status: string,          // "online", "busy", "offline"...
  public email: string,
  public dob: Date,
```
##### Message `message.model.ts`
```ts
public _id: string,
public channelId: string,
public userId: string,
public content: string,
public timestamp: Date,
public attachment?: string,     // some URL
public replyTo?: string         // some message _id
```
##### Ban `ban.model.ts`
```ts
_id: string,
userId: string,
targetId: string,
targetType: "group" | "channel",
date: Date,
reason?: string,
duration?: number
```
##### Membership `membership.model.ts`
// _id is arbitrary here; we are essentially joining unique pairs of "userId" and "groupId".
```ts
public _id: string,
public userId: string,
public groupId: string,
public role: "user" | "admin"
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
#### Endpoints

```
// Most endpoints return relevant object;
// All endpoints return "success: true"

(KEY)
*   = Authenticate
**  = Require Admin
*** = Require Super Admin

[USERS.JS] ('/users')
*** POST('/') -- create new user
*   GET('/group/:groupId') -- fetch users belonging to a group
*   GET('/channel/:channelId') -- fetch users (+roles) belonging to a given channel 
*   PUT('/:userId') -- update a user's details
*   PUT('/:userId/password') -- update a user's password
**  DELETE('/:userId') -- delete a user

[GROUPS.JS] ('/groups')
*** POST('/') -- create a new group
*   GET('/:userId') -- get all groups of a user
**  PUT('/:groupId') -- edit group details (name, image)
*** PUT('/:groupId/:userId') -- grant/revoke admin status of a user
**  PUT('/:groupId/:userId/invite') -- add a user to a group
*** DELETE('/:groupId') -- delete a group (& dependent channels, memberships)

[CHANNELS.JS] ('/channels')
**  POST('/') -- create a new channel
*   GET('/:groupId') -- get channels (by groupId)
**  PUT('/:channelId') -- edit channel details (name, description)
**  DELETE('/:channelId') -- delete channel

[BANS.JS] ('/bans')
**  POST('/group/:groupId/user/:userId') -- ban a user from a group
**  POST('/channel/:channelId/user/:userId') -- ban a user from a channel
**  GET('/target/targetId/active') -- read active bans of a target (group | channel | user)
**  GET('/target/:targetId/all') -- read all bans of a target (group | channel | user)
[MESSAGES.JS] ('/messages')
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


