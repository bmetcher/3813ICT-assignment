export class Channel {
  constructor(
    public _id: string,
    public groupId: string,
    public name: string,
    public description: string,
    public bannedUsers: string[] = [],
    public createdAt: Date
  ) {}
}
