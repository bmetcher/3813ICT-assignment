export class Group {
  constructor(
    public _id: string,
    public name: string,
    public imageUrl: string,
    public bannedUsers: string[] = [],
    public createdAt: Date,
    public open?: boolean
  ) {}
}
