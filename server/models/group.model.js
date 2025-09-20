export class Group {
    constructor(id, name, channels, admins, bannedUsers) {
        this._id = id,
        this.name = name,
        this.channels = channels,
        this.admins = admins,
        this.bannedUsers = bannedUsers
    }
}