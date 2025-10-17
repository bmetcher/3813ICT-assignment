
# 3813ICT Assignment - Phase 2

A real-time chat application built with Angular frontend and Node.js/Express backend using MongoDB and Socket.io.

**GitHub Repository:** https://github.com/bmetcher/3813ICT-assignment/

## Table of Contents
- [Git Repository Organization](#git-repository-organization)
- [Data Structures](#data-structures)
- [Client-Server Architecture](#client-server-architecture)
- [API Routes](#api-routes)
- [Angular Architecture](#angular-architecture)
- [Client-Server Interaction](#client-server-interaction)
- [Installation & Setup](#installation--setup)
- [Testing](#testing)
- [Technologies Used](#technologies-used)

---

## Git Repository Organization

### Repository Structure

```
3813ICT-assignment/
├── server/                          # Backend Node.js application
│   ├── models/                      # Matching collection models
│   ├── public/                      # Static assets served by Express
│   │   ├── avatars/                 # User avatar images
│   │   ├── attachments/             # Message image attachments
│   │   └── groupIcons/              # Group icons (default.png)
│   ├── routes/
│   │   └── api/                     # API endpoint handlers
│   │       ├── bans.js              # Ban management routes
│   │       ├── channels.js          # Channel CRUD routes
│   │       ├── groups.js            # Group CRUD routes
│   │       ├── login.js             # Authentication route
│   │       ├── messages.js          # Message CRUD routes
│   │       └── users.js             # User CRUD routes
│   ├── services/
│   │   └── banService.js            # Automated ban expiry checking
│   ├── tests/                       # Backend integration tests
│   │   └── seedTest.js              # Comprehensive CRUD & seeding test suite
│   ├── utilities/                   # Middleware and helpers
│   │   ├── accessControl.js         # Permission validation functions
│   │   ├── authMiddleware.js        # JWT authentication middleware
│   │   └── upload.js                # Multer file upload configuration
│   ├── mongo.js                     # MongoDB connection management
│   ├── sockets.js                   # Socket.IO configuration & event emitters
│   ├── server.js                    # Express server entry point
│   ├── package.json                 # Backend dependencies
│   └── .env                         # Environment variables (JWT_SECRET)
│
└── chat-app/                        # Frontend Angular application
    ├── src/
    │   ├── app/
    │   │   ├── components/          # UI Components
    │   │   │   ├── chat/            # Main chat container
    │   │   │   ├── details/         # Channel member list panel
    │   │   │   ├── input/           # Message input with file upload
    │   │   │   ├── login/           # Authentication form
    │   │   │   ├── navbar/          # Sidebar with groups & channels
    │   │   │   ├── output/          # Message display feed
    │   │   │   ├── settings/        # User profile settings
    │   │   │   └── admin/           # (Deprecated - not in use)
    │   │   ├── guards/              # Route protection
    │   │   │   └── auth.guard.ts    # Login requirement guard
    │   │   │   └── super.guard.ts   # Super admin requirement guard
    │   │   ├── interceptors/        # HTTP interceptors
    │   │   │   └── auth.interceptor.ts  # JWT token injection
    │   │   ├── models/              # TypeScript interfaces
    │   │   │   ├── user.model.ts
    │   │   │   ├── group.model.ts
    │   │   │   ├── channel.model.ts
    │   │   │   ├── message.model.ts
    │   │   │   ├── membership.model.ts
    │   │   │   └── ban.model.ts
    │   │   └── services/            # HTTP & state management
    │   │       ├── auth.service.ts       # Authentication state
    │   │       ├── context.service.ts    # Global app state
    │   │       ├── socket.service.ts     # Socket.IO client
    │   │       ├── user.service.ts       # User API calls
    │   │       ├── group.service.ts      # Group API calls
    │   │       ├── channel.service.ts    # Channel API calls
    │   │       ├── message.service.ts    # Message API calls
    │   │       ├── ban.service.ts        # Ban API calls
    │   │       └── utility.service.ts    # Helper functions
    │   ├── environments/            # Environment configuration
    │   ├── styles.css               # Global CSS variables (Monokai theme)
    │   └── index.html               # SPA entry point
    ├── angular.json                 # Angular CLI configuration
    └── package.json                 # Frontend dependencies
```

### Branch Strategy
- **main**: Production-ready code
- Regular commits with descriptive messages following conventional commit standards
- `e.g.:  add(avatars): user avatar display & upload`

### Commit History
Development followed iterative approach:
1. Initial setup (Node.js, Angular, MongoDB)
2. Authentication system (JWT tokens, bcrypt)
3. Group and channel management
4. Backend CRUD Endpoints
5. Real-time messaging with Socket.io
6. User management & permissions
7. UI styling and refinements

---

## Data Structures

### Server-side (MongoDB Collections)

#### Users Collection
```javascript
{
  _id: ObjectId,
  username: string,
  email: string,
  avatar: string,         // path to avatar image
  status: string,         // online, busy, offline
  dob: Date,
  password: string,       // hashed with bcrypt
}
```

#### Groups Collection
```javascript
{
  _id: ObjectId,
  name: string,
  imageUrl: string,           // path to group image
  bannedUsers: [ObjectId],
  createdBy: ObjectId,
  createdAt: Date,
}
```

#### Channels Collection
```javascript
{
  _id: ObjectId,
  name: string,
  groupId: ObjectId,
  description: string,
  bannedUsers: [ObjectId],
  createdAt: Date
}
```

#### Messages Collection
```javascript
{
  _id: ObjectId,
  channelId: ObjectId,
  userId: ObjectId,
  content: string,
  attachment: string,      // path to image attachment (optional)
  replyTo: string,         // reference to another message (optional)
  timestamp: Date
}
```

#### Memberships Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  groupId: ObjectId,
  role: string              // 'user', 'admin', 'super'
}
```

#### Bans Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  groupId: ObjectId,
  channelId: ObjectId | null,   // null for group-wide ban
  date: Date,
  bannedBy: ObjectId,
  reason: string,               // ban reason (optional)
  expiresAt: Date               // null for permanent ban
}
```

### Client-Side (TypeScript Interfaces)
Located in `src/app/models/` which mirror server structures with TypeScript types

---

## Client-Server Architecture

### Division of Responsibilities

#### Server Responsibilities (Node.js/Express)
- **Authentication**: JWT Token generation and validation
- **Database Operations**: All CRUD operations on MongoDB
- **File Storage**: Avatar and attachment uploads to filesystem
- **Real-time Events**: Socket.IO event broadcasting
- **Access Control**: Permission validation (admin, super admin)
- **Data Validation**: Input sanitzation and business logic
- **Ban Management**: Automated expiry checking every 5 minutes

#### Client Responsibilities (Angular)
- **UI Rendering**: Component-based view management
- **State Management**: Angular signals for reactive state
- **HTTP Requests**: RESTful API communication via services
- **Socket Handling**: Real-time event listeners
- **Local Caching**: User context and authentication tokens
- **Form Validation**: Client-side input validation
- **Routing**: Single Page Application (SPA) navigation without page reloads

#### Communication Pattern
- **REST API**: HTTP requests for CRUD operations returning JSON with `{ data, success: true }` format
- **WebSocket**: Socket.IO for real-time updates (messages, user presence, admin actions)
- **File Upload**: Multipart form data for images (avatars, attachments)

---

## API Routes

### Authentication

| Method | Route | Parameters | Returns | Purpose |
|--------|-------|------------|---------|---------|
| POST | `/api/login` | `{ email, password }` | `{ token, userId }` | User login, JWT generation |

### Users

| Method | Route | Parameters | Returns | Purpose |
|--------|-------|------------|---------|---------|
| POST | `/api/users` | `{ username, email, password, avatar?, status?, dob? }` | `{ createdUser, success }` | Create user (super admin only) |
| GET | `/api/users/:userId` | userId (param) | `{ user, success }` | Get user by ID (excludes password) |
| GET | `/api/users/group/:groupId` | groupId (param) | `{ users, success }` | Get all users in group |
| GET | `/api/users/channel/:channelId` | channelId (param) | `{ users, success }` | Get users in channel (filtered by bans, includes roles) |
| PUT | `/api/users/:userId` | userId, `{ username?, avatar?, status?, email?, dob? }` | `{ updatedUser, success }` | Update user profile (self or super admin) |
| PUT | `/api/users/:userId/password` | userId, `{ oldPassword, newPassword }` | `{ success }` | Update user password (self or super admin) |
| POST | `/api/users/:userId/avatar` | userId, file (multipart/form-data) | `{ user, avatarUrl, success }` | Upload avatar image (max 5MB) |
| DELETE | `/api/users/:userId` | userId (param) | `{ deletedUser, success }` | Delete user and memberships (super admin only) |

### Groups

| Method | Route | Parameters | Returns | Purpose |
|--------|-------|------------|---------|---------|
| POST | `/api/groups` | `{ group: { name }, imageUrl? }` | `{ createdGroup, success }` | Create group with default channel (super admin only) |
| GET | `/api/groups/:userId` | userId (param) | `{ groups, memberships, success }` | Get user's groups and their roles |
| PUT | `/api/groups/:groupId` | groupId, `{ name?, imageUrl? }` | `{ group, success }` | Update group details (admin/super) |
| PUT | `/api/groups/:groupId/:userId` | groupId, userId, `{ newRole }` | `{ updatedMembership, success }` | Promote/demote user (super admin only) |
| PUT | `/api/groups/:groupId/:userId/invite` | groupId, userId | `{ success }` | Add user to group (admin/super) |
| DELETE | `/api/groups/:groupId` | groupId (param) | `{ success }` | Delete group, channels, memberships (super admin only) |
| DELETE | `/api/groups/:groupId/:userId` | groupId, userId | `{ success }` | Remove user from group (admin/super, not super admins) |

### Channels

| Method | Route | Parameters | Returns | Purpose |
|--------|-------|------------|---------|---------|
| POST | `/api/channels` | `{ channel: { name, groupId, description? } }` | `{ newChannel, success }` | Create channel (admin/super) |
| GET | `/api/channels/:groupId` | groupId (param) | `{ channels, success }` | Get channels in group (excludes bannedUsers array) |
| PUT | `/api/channels/:channelId` | channelId, `{ name?, description? }` | `{ channel, success }` | Update channel (admin/super) |
| DELETE | `/api/channels/:channelId` | channelId (param) | `{ success }` | Delete channel (admin/super) |

### Messages

| Method | Route | Parameters | Returns | Purpose |
|--------|-------|------------|---------|---------|
| POST | `/api/messages/channel/:channelId` | channelId, `{ content, attachment?, replyTo? }` | `{ createdMessage, success }` | Send message |
| POST | `/api/messages/attachment` | file (multipart/form-data) | `{ attachmentUrl, success }` | Upload image attachment (max 10MB) |
| GET | `/api/messages/channel/:channelId` | channelId, `?limit=50&before=date` | `{ messages, success }` | Get paginated messages (default 50) |
| PUT | `/api/messages/channel/:channelId/message/:messageId` | channelId, messageId, `{ content }` | `{ updatedMessage, success }` | Edit own message |
| DELETE | `/api/messages/channel/:channelId/message/:messageId` | channelId, messageId | `{ deletedMessage, success }` | Delete own message |

### Bans

| Method | Route | Parameters | Returns | Purpose |
|--------|-------|------------|---------|---------|
| POST | `/api/bans/group/:groupId/user/:userId` | groupId, userId, `{ reason?, duration }` | `{ ban, success }` | Ban user from group (admin/super). Duration in seconds or -1 for permanent |
| POST | `/api/bans/group/:groupId/channel/:channelId/user/:userId` | groupId, channelId, userId, `{ reason?, duration }` | `{ ban, success }` | Ban from channel (admin/super) |
| GET | `/api/bans/group/:groupId/active` | groupId (param) | `{ bans, success }` | Get active bans for group |
| GET | `/api/bans/group/:groupId/all` | groupId (param) | `{ bans, success }` | Get all bans (active + expired) |
| GET | `/api/bans/group/:groupId/channel/:channelId/active` | groupId, channelId | `{ bans, success }` | Get active bans for channel |
| GET | `/api/bans/group/:groupId/user/:userId/active` | groupId, userId | `{ bans, success }` | Get active bans for user |
| PUT | `/api/bans/:banId` | banId, `{ reason?, duration? }` | `{ updatedBan, success }` | Update ban reason/duration (admin/super) |
| DELETE | `/api/bans/:banId` | banId (param) | `{ deletedBan, success }` | Remove ban (admin/super) |

**Authentication**: All routes except `/api/login` require `Authorization: Bearer <token>` header

---

## Angular Architecture

### Components

#### Layout Components
- **AppComponent**: Root component with routing outlet
- **NavbarComponent**: Sidebar with groups/channels navigation
- **DetailsComponent**: Right panel showing channel members

#### Feature Components
- **LoginComponent**: User authentication form
- **SettingsComponent**: User profile management
- **ChatComponent**: Main chat interface container
- **InputComponent**: Message composition with file upload and preview
- **OutputComponent**: Message display with edit/delete actions

### Services

#### Core Services
- **AuthService**: Authentication state, JWT token management
- **ContextService**: Global application state (groups, channels, messages)
- **SocketService**: Socket.io connection and event handling

#### Data Services
- **UserService**: User CRUD HTTP requests
- **GroupService**: Group management API calls
- **ChannelService**: Channel operations
- **MessageService**: Message sending and retrieval
- **BanService**: Ban management

#### Utility Services
- **UtilityService**: Helper functions (avatar URLs, formatting)

### Models (TypeScript Interfaces)
- `User`, `Group`, `Channel`, `Message`, `Membership`, `Ban`
- Located in `src/app/models/`
- Define data structure contracts between services and components

### Routes
| Path | Component | Guard | Purpose |
|------|-----------|-------|---------|
| `/login` | LoginComponent | None | Authentication |
| `/chat` | ChatComponent | AuthGuard | Main chat interface |
| `/settings` | SettingsComponent | AuthGuard | User settings |
| `/` | Redirect to `/chat` | None | Default route |

---

## Client-Server Interaction

### Initialization Flow

1. **User Login**
   - Client: POST `/api/login` with `{ email, password }`
   - Server: Validates credentials with bcrypt, generates JWT
   - Server: Returns `{ token, userId }`
   - Client: Stores token in localStorage
   - Client: Fetches full user data via GET `/api/users/:userId`
   - Client: Calls `loadUserContext(userId)`

2. **Loading User Context**
   - Client: GET `/api/groups/:userId`
   - Server: Returns `{ groups, memberships }`
   - Client: For each group, GET `/api/channels/:groupId`
   - Server: Returns `{ channels }` (filtered by user access)
   - Client: Stores in ContextService signals (`_groups`, `_channels`, `_memberships`)

3. **Socket Connection**
   - Client: Connects to Socket.IO with JWT token in handshake auth
   - Server: Validates token via middleware, attaches `userId` to socket
   - Client: Joins group rooms for each group user belongs to
   - Client: When channel selected, joins channel-specific room
   - Server: Socket rooms enable targeted broadcasts

### Real-Time Updates (Socket.IO Events)

#### Message Flow
1. User types message, clicks send (or presses Enter)
2. Client: POST `/api/messages/channel/:channelId` with `{ content, attachment? }`
3. Server: Validates user access via `canAccessChannel()`, saves to MongoDB
4. Server: `io.to(channelId).emit('messageCreated', message)`
5. All clients in channel room: Receive event in `setupSocketListeners()`
6. Client: `context._messages.set([...existing, newMessage])`
7. OutputComponent: Automatically re-renders via Angular change detection

#### Admin Actions Flow (e.g., Promote User)
1. Admin clicks "Promote to Admin" in DetailsComponent
2. Client: PUT `/api/groups/:groupId/:userId` with `{ newRole: 'admin' }`
3. Server: Updates membership document in MongoDB
4. Server: `io.to(groupId).emit('membershipUpdated', membership)`
5. All clients in group: Receive event
6. Client: Updates `context._memberships` signal
7. Roles automatically update across all components

#### Ban User Flow
1. Admin clicks "Ban from Channel" in DetailsComponent
2. Client: POST `/api/bans/group/:groupId/channel/:channelId/user/:userId`
3. Server: Creates ban document in MongoDB
4. Server: `io.to(channelId).emit('banCreated', ban)`
5. All clients in channel: Receive event
6. Client: Filters banned user from `context._users` signal
7. DetailsComponent: User removed from member list
8. Banned user: Loses access to channel immediately

### File Upload Flow

#### Avatar Upload
1. User selects image file in SettingsComponent
2. Client: Validates file type (JPG/PNG/GIF/WebP) and size (max 5MB)
3. Client: Creates FormData with file
4. Client: POST `/api/users/:userId/avatar`
5. Server: Multer middleware saves to `public/avatars/` with unique filename
6. Server: Deletes old avatar file (if not default)
7. Server: Updates user document with new avatar path
8. Server: `io.emit('userUpdated', user)` (global broadcast)
9. All clients: Receive event, update cached user data
10. Client: UI automatically updates with new avatar URL

#### Message Attachment Upload
1. User selects image in InputComponent
2. Client: Shows preview thumbnail
3. Client: POST `/api/messages/attachment` with file
4. Server: Saves to `public/attachments/`
5. Server: Returns `{ attachmentUrl }`
6. Client: Includes `attachmentUrl` in message POST
7. Server: Saves message with attachment reference
8. Server: Broadcasts message to channel
9. OutputComponent: Displays message with clickable image

### State Synchronization
**Client State (Angular Signals)**
- `currentUser`: Logged-in user object
- `groups`: Array of groups user belongs to
- `channels`: Array of channels in selected groups
- `currentChannel`: Active channel being viewed
- `messages`: Messages in current channel
- `users`: Users in current channel
- `memberships`: User roles across groups

**Server State Changes Trigger:**
- Database update
- Socket.IO broadcast to relevant room
- Client receives event
- Signal updated via `signal.set(newValue)`
- Angular detects change, re-renders affected components

**Example: User Banned**
1. Admin clicks "Ban User"
2. POST `/api/bans/group/:groupId/channel/:channelId/user/:userId`
3. Server inserts ban record
4. Server: `io.to(channelId).emit('banCreated', ban)`
5. Client: `socketService.on('banCreated')` handler fires
6. Client: Removes banned user from `users` signal
7. DetailsComponent: User disappears from list automatically

---

## Installation & Setup

### Prerequisites
- Node.js (v16+)
- MongoDB (v5+)
- Angular CLI (v19+)

### Backend Setup
```bash
cd server
npm install

# create .env file
echo "JWT_SECRET=your-secret-key-here" > .env

# start server
node server.js
```
Server runs on `http://localhost:3000`

### Frontend Setup
```bash
cd chat-app
npm install

# development server
ngh serve
```
Application runs on `http://localhost:4200`

### Default Super Admin
- Email: `super@example.com`
- Password: `123`

---

## Testing

### Unit Tests (Angular)
```bash
cd chat-app
ng test                         # Run tests in watch mode
ng test --watch=false           # Run once
ng test --code-coverage         # Generate coverage report
```
**Test Coverage:**
- **LoginComponent**: Form validation, error handling, authentication flow
- **SettingsComponent**: Navigation, logout confirmation, profile updates
- **UtilityService**: Avatar URL construction, default handling
- Component creation and initialization

Coverage reports generated in `coverage/` directory.

### Backend Integration Tests (Mocha/Chai)

Located in `server/tests/seedTest.js` - comprehensive test suite covering all CRUD operations.
```bash
cd server
npx mocha tests/seedTest.js
```

**Test Scope:**
- **User Operations**: Create, read, update, delete users; password changes; profile updates
- **Group Operations**: Create groups, invite users, promote/demote admins, update details, delete groups
- **Channel Operations**: Create channels, get channels by group, update channel details, delete channels
- **Message Operations**: Send messages, retrieve paginated messages, edit own messages, delete own messages
- **Ban Operations**: Ban users from groups/channels, retrieve active/all bans, update ban reason/duration, remove bans
- **Permission Validation**: Super admin restrictions, admin-only operations, self-service actions
- **Data Integrity**: Cascading deletes (group deletion removes channels and memberships)

**Test Flow:**
1. Clears all MongoDB collections
2. Creates super admin user and group
3. Authenticates and obtains JWT token
4. Runs 29 test cases across 6 operation categories
5. Verifies HTTP responses and database state
6. Reports summary of created entities

---

## Features
* Real-time messaging with Socket.io
* Group and channel management
* User roles (User, Admin, Super Admin)
* Image attachments in messages
* Avatar uploads
* User ban system (temporary & permanent)
* Message editing and deletion
* Responsive modern UI with Monokai colour theme
* JWT authentication
* Persistent storage (MongoDB)

---

## Technologies Used

**Frontend:**
- Angular 20.1 (standalone components, signals)
- TypeScript 5.8
- Socket.IO Client 4.8.1
- RxJS 7.8 (observables, HTTP client)
- Bootstrap 5.3.8 (utility classes)
- Zone.js 0.15 (change detection)

**Backend:**
- Node.js 16+
- Express 5.1
- MongoDB 6.20 (native driver)
- Socket.IO 4.8.1
- JWT (jsonwebtoken 9.0.2)
- Multer 2.0.2 (file uploads)
- bcrypt 6.0 (password hashing)
- CORS 2.8.5 (cross-origin support)
- dotenv 17.2.3 (environment variables)

**Development Tools:**
- Nodemon 3.1.10 (auto-restart server)
- Angular CLI 20.1.5

**Testing:**
- **Frontend**: Jasmine 5.8, Karma 6.4
- **Backend**: Mocha 11.7.4, Chai 6.2, Supertest 7.1.4

---

## Future Additions

### Main Features
- Direct messaging between users
- Video/voice calls
- Screen sharing
- Message reactions
- Read receipts
- Typing indicators
- Search functionality
- UI customization
  - compact/full message view
  - rounded/square UI
  - colour themes
  - group & channel customization

### Fixes & Extras
* Group Icons
* Admin can delete other user's messages
* "Grey-out Server" for a banned user: view ban details on click
* Record old messages/bans for time
* Handle display of removed user's messages
* "welcome" and "super" groups (?)


