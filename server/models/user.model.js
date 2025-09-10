export class User {
    constructor(id, username, email, groups, password, avatar, superAdmin, valid) {
        this.id = id,
        this.username = username,
        this.email = email,
        this.groups = groups,
        this.password = password,
        this.avatar = avatar,
        this.superAdmin = superAdmin,
        this.valid = valid
    }
}