
# [3813ICT Assignment - Phase 2](https://github.com/bmetcher/3813ICT-assignment/)

## Project Overview
Web-based chat application with groups, channels and role-based user permissions.
### Phase 2 Focus:
* MongoDB backend for persistent storage (CRUD operations)
* Socket.io for real-time messaging
* Role-based access control: Super Admin, Group Admin, and User
* Polished, reactive UI using Angular signals and components.

<br><br>
***
### Data Structures
#### Models
*Notes:*
- *All instances of "_id" are Mongo ObjectId on the server's side*
- *Users access channels via 'memberships'. Channels themselves don't have separate memberships; bans are the only "per-channel" restriction/s.*
##### User
```ts
_id: string,
username: string,
avatar: string,          // URL
status: string,          // online, offline, busy
email: string,
dob: Date,
// ** KEEP ??? **   password, valid
```
##### Group `group.model.ts`
```ts
_id: string,
name: string,
imageUrl: string,
bannedUsers: string[] = [],
createdAt: Date,
open?: boolean             // UI only: show group's channels
```
##### Channel `channel.model.ts`
```ts
_id: string,
groupId: string,
name: string,
description: string,
bannedUsers: string[] = [],
createdAt: Date
```
##### Membership `membership.model.ts`
```ts
_id: string,
userId: string,
groupId: string,
role: "user" | "admin"
```
##### Message `message.model.ts`
```ts
_id: string,
channelId: string,
userId: string,
content: string,
timestamp: Date,
attachment?: string,     // some URL
replyTo?: string         // some message _id
```
##### Ban `ban.model.ts`
```ts
_id: string,
userId: string,
groupId: string,
channelId: string | null, // null channelId -> group ban
date: Date,
bannedBy: string,         // admin's userId
reason?: string,
expiresAt?: number        // null expiry -> permanent ban
```

##### Server Environment File `.env.example`
```
JWT_SECRET=your-secret-key-here
MONGODB_URI=mongodb://localhost:27017
DB_NAME=chat-app
```

***
### REST API
??? Do we need to mention specific returns?
* All endpoints return a JSON object: 
  * Success: `{ data, success: true }`
  * Failure: `{ error: string }`

#### Login (/login)
|Method|Endpoint             |Auth |Description                            |
|------|---------------------|-----|---------------------------------------|
|POST  |`/`                  |None |Attempt login; returns a Java Web Token|
#### Users (/users)
|Method|Endpoint             |Auth |Description                            |
|------|---------------------|-----|---------------------------------------|
|POST  |`/`                  |Super|Create a new user (password hashed)    |
|POST  |`/:userId/avatar`    |Self |Upload a new avatar for the user       |
|GET   |`/:userId`           |Auth |Get a single user by ID                |
|GET   |`/group/:groupId`    |Auth |Get all users in a group               |
|GET   |`/channel/:channelId`|Auth |Get all users in a channel (with role) |
|PUT   |`/:userId`           |Self |Update a user                          |
|PUT   |`/:userId/password`  |Self |Update a user's password               |
|DELETE|`/:userId`           |Super|Delete a user & their memberships      |
#### Groups (/groups)
|Method|Endpoint                 |Auth |Description                             |
|------|-------------------------|-----|----------------------------------------|
|POST  |`/`                      |Super|Create a group                          |
|GET   |`/:userId`               |Auth |Get all groups of a user                |
|PUT   |`/:groupId`              |Admin|Edit group details                      |
|PUT   |`/:groupId/:userId`      |Super|Grant or revoke group admin for a user  |
|PUT   |`/:groupId/:userId/invite|Super|Add user to group ("invite")            |
|DELETE|`/:groupId`              |Super|Delete group & it's channels/memberships|
#### Channels (/channels)
|Method|Endpoint                 |Auth |Description                             |
|------|-------------------------|-----|----------------------------------------|
|POST  |`/`                      |Admin|Create a channel                        |
|GET   |`/:groupId`              |Auth |Get all channels of a group             |
|PUT   |`/:channelId`            |Admin|Edit a channel                          |
|DELETE|`/:channelId`            |Admin|Delete a channel                        |
#### Bans (/bans/group/:groupId)
* *Note: All endpoints are scoped to a group, except for `PUT` and `DELETE` which operate directly on ban IDs (`/bans/:banId`).*

|Method|Endpoint                          |Auth |Description                             |
|------|----------------------------------|-----|----------------------------------------|
|POST  |`/user/:userId`                   |Admin|Ban a user from a group                 |
|POST  |`/channel/:channelId/user/:userId`|Admin|Ban a user from a channel               |
|GET   |`/active`                         |Admin|Get current bans of a group             |
|GET   |`/channel/:channelId/active`      |Admin|Get current bans of a channel           |
|GET   |`/user/:userId/active`            |Admin|Get current bans of a user              |
|GET   |`/all`                            |Admin|Get all bans of a group                 |
|GET   |`/channel/:channelId/all`         |Admin|Get all bans of a channel               |
|GET   |`/user/:userId/all`               |Admin|Get all bans of a user                  |
|PUT   |`/:banId`                         |Admin|Edit reason or duration of a ban        |
|DELETE|`/:banId`                         |Admin|Delete a ban                            |

#### Messages (/messages)
|Method|Endpoint                                |Auth |Description                          |
|------|----------------------------------------|-----|-------------------------------------|
|POST  |`/channel/:channelId`                   |Auth |Send a message to a channel          |
|GET   |`/channel/:channelId`                   |Auth |Get messages of a channel (paginated)|
|PUT   |`/channel/:channelId/message/:messageId`|Self |Edit a message                       |
|DELETE|`/channel/:channelId/message/:messageId`|Self |Delete a message                     |

***
### Socket.io Emittals
Entities being created, updated, or deleted are emitted
<br>
Except 'Create' for 'User' and 'Group' being created, as it is only relevant to the Super Admin who created them

|Event  |Message|Ban|Group|Membership|Channel|User|
|-------|-------|---|-----|----------|-------|----|
|Create |   X   | X |  O  |     X    |   X   | O  |
|Update |   X   | X |  X  |     X    |   X   | X  |
|Delete |   X   | X |  X  |     X    |   X   | X  |

Clients can listen for these events to update reactive UI automatically without polling

***
### Angular Architecture
#### Component Structure
```
app/
├─ admin/          # Super Admin management page
├─ chat/
│  ├─ details/     # List members, show roles, admin buttons
│  ├─ input/       # Chat input box
│  └─ output/      # Messages display
├─ login/
├─ navbar/         # Groups & channels list
└─ settings/       # Profile settings
```

#### Guards
* `auth.guard.ts`   -- prevents access to routes if not logged in
* `super.guard.ts`  -- prevents access if user doesn't have some `super` role

#### Services
* `auth.service.ts`
  * Stores JWT, logged-in userId
  * Login & Logout
* `ban.service.ts`
  * pure CRUD
* `channel.service.ts`
  * setSelectedChannel & CRUD
* `context.service.ts`
  * stores & sets global states: users, groups, memberships, messages
* `group.service.ts`
  * group CRUD
  * invite, promote/demote group admin roles
* `message.service.ts`
  * pure CRUD
* `socket.service.ts`
  * connect & disconnect to socket
  * listen & emit socket events
* `user.service.ts`
  * CRUD including: 
    * get user (or list of users by group/channel)
    * update password or details
* `utilities.service.ts`
  * AvatarHelper

#### Signals
* `currentChannel`: currently selected channel (for chat component/s)
* `messages`: paginated message list of current channel
* `users`, `groups`, `channels`: reactive lists from context service

<br>

***
### Data Handling & Persistence
* **Frontend**: Signals in context store reactive data, synchronized with MongoDB and Sockets
* **Backend**: Node.js + Express, CRUD operations updated MongoDB collections (`users`, `groups`, `channels`, `memberships`, `messages`, `bans`)
* **Super Admin**: Can create or remove users and groups. Where admins manage channels, and invite, remove or ban users in groups or channels.

***
### Notes & Future Improvements
#### Fixes & Extras
* [X] Initial seed test file
* [X] Include creating super admin, group, etc.
<br>
* [...] Multimedia Handling -- Upload/Download
  * [X] User Avatars
  * [ ] Group Icons
  * [ ] Files (size limit, type limit)
    * file types later?: (.mp3, .wav, .png, .jpg, .gif, .mp4)
  * [ ] Display Timestamps on Posts (Optional in Settings?)
<br><br>
* [ ] Video chat (PeerJS)
  * [ ] Output Component Display
  * [ ] Input & Display Component "Adjust" for Video Chat
  * [ ] "React" with emotes?
* [ ] Screen Share?
<br><br>
**Messages & Bans**
* [ ] allow admin to delete other *user's messages
* [ ] "greyed out" server; click --> provide a client their ban's details
* [ ] edit/delete --> "graveyard" or "cold storage" for "deleted" bans and messages
* [ ] Handle message display of users who aren't in the channel anymore
<br><br>
**Groups**
* [ ] "Welcome/Global Group" for new users
* [ ] "Super Group" for admin UI? or else?
<br><br>
**UI**
* [ ] Pop-up Lists (Modals??)
  * [ ] Settings there?

#### Polish
* [ ] Favourite/Home a Channel? (load on each login?)

* [ ] Base UI Theme
  * [ ] Colour
  * [ ] Scale; no weird scrolling, "size: 1/1.25/1.50/1.75/2.0" or so
    * [ ] Show/hide Navbar, Details
  * [ ] Icons

* [ ] Animations
  * [ ] UI Buttons
    * [ ] Expand/Hide
    * [ ] Output Settings
***
**LATER UPDATES**
* [ ] Customizations
  * [ ] Compact/Full Messages
  * [ ] Rounded/Square UI, etc.
  * [ ] Colour Themes
  * [ ] Group or Channel Appearances??

***
### !!! For Me to Integrate to current README !!!
##### ??? Login Flow
Login -> Get Token -> Fetch full user object 
-> Store in AuthService -> Load Context -> Navigate to Chat
##### Assets Structure
* **Backend** (`/server/public/`): User-generated content (avatars, attachments, group icons..)
```
chat-app/
│
├── server/
│   ├── node_modules/
│   ├── public/                      # ← USER CONTENT (persists, backed up)
│   │   ├── avatars/
│   │   │   ├── default.png         # ← Default fallback
│   │   │   ├── 68eb82a141b296915cdb8b60.jpg  # ← User avatars by ID
│   │   │   └── 68f076430decb0cd8c5eab21.png
│   │   ├── groupIcons/
│   │   │   ├── default.png
│   │   │   └── 68eb86131c640a9dcb4e9dd7.jpg
│   │   └── attachments/
│   │       └── 68f123_document.pdf
...
```
**MULTER**: Node.JS middleware that handles file uploads from HTML forms.


* **Frontend** (`/src/assets/`): UI elements (icons, fonts, default images..)


***

### Roles & Permissions (keep or remove this?)

|Role        | Permissions (Phase 1)                                                |
|------------|----------------------------------------------------------------------|
|Super Admin | Create/remove users, assign group admins, view all groups & channels |
|Group Admin | Manage channels within groups, invite or remove users to channels    |
|User        | View channels & members, send messages                               |

