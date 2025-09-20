export class Message {
    constructor(
        public _id: string,
        public channelId: string,
        public userId: string,
        public content: string,
        public timestamp: Date,
    ) {}
}
