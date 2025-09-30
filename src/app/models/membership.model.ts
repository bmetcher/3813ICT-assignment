export class Membership {
    constructor(
        public _id: string,
        public userId: string,
        public groupId: string,
        public role: "user" | "admin" | "super"
    ) {}
}