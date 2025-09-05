import { User } from "./models/user.model";

export const Users: User[] = [
  { id: '1', username: 'Bob', email: 'abc@com.au', password: '123',
    groups: ["Group 1", "Group 2", "Group 3"], superAdmin: true, valid: true },

  { id: '2', username: 'Sally', email: 'def@com.au', password: '456',
    groups: ["Group 1", "Group 2"], superAdmin: false, valid: true },

  { id: '3', username: 'Craig', email: 'ghi@com.au', password: '789',
    groups: ["Group 2", "Group 3", "Group 4"], superAdmin: false, valid: true }
];
