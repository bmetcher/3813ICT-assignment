export class Channel {
    constructor(id, groupId, name, description, bannedUsers, userId, date) {
        this._id = id,
        this.groupId = groupId,
        this.name = name,
        this.description = description,
        this.bannedUsers = bannedUsers,
        this.createdBy = userId,
        this.createdAt = date
    }
}