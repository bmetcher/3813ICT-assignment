export class Message {
    constructor(id, channelId, userId, content, timestamp, attachment, replyTo) {
        this._id = id,
        this.channelId = channelId,
        this.userId = userId,
        this.content = content,
        this.timestamp = timestamp,
        this.attachment = attachment,
        this.replyTo = replyTo
    }
}