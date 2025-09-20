export class Message {
    constructor(id, channelId, userId, content, timestamp) {
        this._id = id,
        this.channelId = channelId,
        this.userId = userId,
        this.content = content,
        this.timestamp = timestamp
    }
}