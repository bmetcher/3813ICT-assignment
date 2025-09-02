# 3813ICT Assignment

## Project Overview
Web-app chat with groups & channels and users with roles & permissions

* Phase 1 Requirements:
- User Creation
- Login
- Assign Groups & Channels
- Role-based Views
- UI Skeleton
- Wireframes

### UI Layout
- login page -> username+password (non-functioning)
- dashboard -> list groups + channels
- chat windows -> dummy messages + input box (non-functioning)
- profile -> shows logged-in user info (editable)
- settings -> placeholder for editing app settings (e.g.: volume, full or short message appearance, etc.)

# To Be Sorted:
* Roles:
- super admin
    + can create & edit groups
    + can assign group-admins
    > show dummy buttons for "Promote User", "Remove User", etc.
- group admin
    + can create & edit channels
    + can invite users
    > dummy "Create Channel" button
- user
    - contains user details
    - can join channels, send messages... (not yet)
    > chat, join/leave group?
Maybe "Dashboard" can search Group List? 
then groups can be PUBLIC/PRIVATE
(open or invite-only)

* Passwords with B-Crypt etc. ? 
    
    
## Data Structures

### Angular Architecture

#### Models:
export interface User {
    id: string;
    username: string;
    email: string;
    role: 'super' | 'group' | 'user';
    groups: string[];
}
export interface Group {
    id: string;
    name: string;
    admins: string[];
    channels: string[];
}
export interface Channel {
    id: string;
    name: string;
    type: 'text';
    groupId: string;
    messages: string[];
}


#### Components:
- login
- dashboard (?)
- chat
- profile
- settings
- sidebar

// pop-up user-list?

#### Services  (phase 1 uses dummy information to/from localStorage):
auth.service.ts -> stores user
data.service.ts -> loads users/groups/channels


### Node Server Architecture
/server
|- server.js

* Routes (return a dummy JSON):
- POST /login
- GET /users
- GET /groups
- GET /channels/:groupId








