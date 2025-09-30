export class Ban {
    constructor(id, userId, groupId, channelId, date, adminId, reason, expiresAt) {
        this._id = id,
        this.userId = userId,
        this.groupId = groupId,
        this.channelId = channelId,
        this.date = date,
        this.bannedBy = adminId,
        this.reason = reason,
        this.expiresAt = expiresAt
    }
}