export class Ban {
    constructor(id, userId, targetId, targetType, date, reason, duration) {
        this._id = id,
        this.userId = userId,
        this.targetId = targetId,
        this.targetType = targetType,
        this.date = date,
        this.reason = reason,
        this.duration = duration
    }
}