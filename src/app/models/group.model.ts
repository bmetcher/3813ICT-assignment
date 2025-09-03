export class Group {
  constructor(
    public id: string,
    public name: string,
    public admins: string[] = [],
    public members: string[] = [],
    public channels: string[] = []
  ) {}
}
