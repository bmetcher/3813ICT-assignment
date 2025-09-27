export class Group {
    constructor(id, name, imageUrl, bannedUsers, userId, date) {
        this._id = id,
        this.name = name,
        this.imageUrl = imageUrl,
        this.bannedUsers = bannedUsers,
        this.createdBy = userId,
        this.createdAt = date
    }
}