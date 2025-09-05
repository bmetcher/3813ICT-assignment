export class User {
  constructor(
    public id: string,
    public username: string,
    public email: string,
    public groups: string[] = [],
    public password?: string,   // Phase 1 only; not secure
    public avatar?: string,     // URL for user's saved image
    public superAdmin: boolean = false,
    public valid: boolean = false
  ) {}
}
