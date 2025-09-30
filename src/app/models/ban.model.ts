export class Ban {
    constructor(
        _id: string,
        userId: string,
        groupId: string,
        channelId: string | null,
        date: Date,
        bannedBy: string,
        reason?: string,
        expiresAt?: Date
    ) {}
}
