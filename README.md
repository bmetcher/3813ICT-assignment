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

* Bootstrap Installed
    
    
## Data Structures

### Angular Architecture

#### Models:
* user.model.ts
  public id: string,
  public username: string,
  public email: string,
  public groups: string[] = [],
  public password?: string, // Phase 1 only; not secure
  public avatar?: string,    // URL for user's saved image
  public superAdmin?: boolean = false

* group.model.ts
  public id: string,
  public name: string,
  public admins: string[] = [],
  public members: string[] = [],
  public channels: string[] = []

* channel.model.ts
  public id: string,
  public name: string,
  public groupId: string,
  public members: string[] = [],
  public messages: { userId: string, content: string, timestamp: Date }[] = []


#### Components:
- login-component   (if (!loggedIn): '/login' is the "home page")
- chat-component    (if (loggedIn): "/chat" is the "home page")
  - output-view-component (channel output -> messageList of "channelJoined")
  - input-view-component  (user input -> text, image, voice, etc.)
- channel-details   (if(channelJoined): Pop-out, RHS)
- sidebar-component (Navigate to: Settings, Group & Channel List)
- settings-component
> set user's own data (pwd, dob, pfp, etc.)
> edit client/UI settings (volume, scale, colours(?), devices etc.)

- login:  default home page
- chat:   new default (if loggedIn) (parent)
  - output
  - input
  - details
- settings
  > (if loggedIn) can set the user's own data (password, DoB, avatar, ...)
  > can always edit settings (peripherals, UI colour, etc.)
- navbar
  > (if loggedIn) 
    > populated with groupList
    > populated with currentUser
  > (if activeGroup) populated with group's channelList
  > 

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








