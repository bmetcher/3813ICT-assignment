export class Message {
    constructor(
        public _id: string,
        public channelId: string,
        public userId: string,
        public content: string,
        public timestamp: Date,
        public attachment?: string,     // some URL
        public replyTo?: string         // some message _id
    ) {}
}
