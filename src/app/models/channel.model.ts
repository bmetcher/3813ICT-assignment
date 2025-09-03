export class Channel {
  constructor(
    public id: string,
    public name: string,
    public groupId: string,
    public members: string[] = [],
    public messages: { userId: string, content: string, timestamp: Date }[] = []
  ) {}
}
