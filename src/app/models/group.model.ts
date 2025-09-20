export class Group {
  constructor(
    public _id: string,
    public name: string,
    public channels: string[] = [],
    public admins: string[] = [],
    public bannedUsers: string[] = [],
    public open?: boolean
  ) {}
}
