export class User {
  constructor(
    public _id: string,
    public username: string,
    public groups: string[] = [],   // group & channel populated by Server
    public channels: string[] = [],
    
    public avatar: string,         // URL for user's saved image
    public status: string,          // "online", "busy", "offline"...
    public email: string,
    public dob: Date,

    public password?: string,   // Phase 1 only; not secure
    public superAdmin: boolean = false,
    public valid: boolean = false,
  ) {}
}
