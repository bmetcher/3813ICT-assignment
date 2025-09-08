import { User } from "./models/user.model";
import { Group } from "./models/group.model";
import { Channel } from "./models/channel.model";

export const Users: User[] = [
  { id: '1', username: 'Bob', email: 'abc@com.au', password: '123', avatar: 'assets/dog.png',
    groups: ["Group 1", "Group 2", "Group 3"], superAdmin: true, valid: true },

  { id: '2', username: 'Sally', email: 'def@com.au', password: '456', avatar: 'assets/hamster.png',
    groups: ["Group 1", "Group 2"], superAdmin: false, valid: true },

  { id: '3', username: 'Craig', email: 'ghi@com.au', password: '789', avatar: '/assets/piglet.png',
    groups: ["Group 2", "Group 3", "Group 4"], superAdmin: false, valid: true }
];

export const GuestUser: User = {
    id: '',
    username: 'Guest',
    email: '',
    groups: [],
    password: '',
    avatar: 'assets/default-avatar.png',
    superAdmin: false,
    valid: false
};

export const Groups: Group[] = [
  { id: '1', name: 'Group 1', admins: ['1'], members: ['1', '2'], 
    channels: ['1', '2'], open: false },
  { id: '2', name: 'Group 2', admins: ['1', '2'], members: ['1', '2', '3'], 
    channels: ['3', '4', '5'], open: false },
  { id: '3', name: 'Group 3', admins: ['2'], members: ['1', '3'], 
    channels: ['6', '7'], open: false },
  { id: '4', name: 'Group 4', admins: ['3'], members: ['3'], 
    channels: ['8', '9'], open: false}
];

export const Channels: Channel[] = [
  { id: '1', name: 'Announcements', groupId: '1', members: ['1', '2'], messages: [ 
      { userId: '1', content: "Test Announcement!", timestamp: new Date },
      { userId: '2', content: "Secondary message here!", timestamp: new Date },
      { userId: '1', content: "Third and final. How is that?", timestamp: new Date },
  ]},
  { id: '2', name: 'Q&A', groupId: '1', members: ['1', '2'], messages: [
    { userId: '2', content: "I have a question...", timestamp: new Date },
    { userId: '1', content: "Here is your answer!", timestamp: new Date },
  ]},
  { id: '3', name: 'Announcements', groupId: '2', members: ['1', '2', '3'], messages: []},
  { id: '4', name: 'Public', groupId: '2', members: ['1', '2', '3'], messages: []},
  { id: '5', name: 'FAQ', groupId: '2', members: ['1', '2', '3'], messages: []},
  { id: '6', name: 'Announcements', groupId: '3', members: ['1', '3'], messages: []},
  { id: '7', name: 'Q&A', groupId: '3', members: ['1', '3'], messages: []},
  { id: '8', name: 'Announcements', groupId: '4', members: ['3'], messages: []},
  { id: '9', name: 'Testing Chat', groupId: '3', members: ['3'], messages: []},
];