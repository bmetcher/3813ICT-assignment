export class Ban {
    constructor(
        _id: string,
        userId: string,
        targetId: string,
        targetType: "group" | "channel",
        date: Date,
        reason?: string,
        duration?: number
    ) {}
}
