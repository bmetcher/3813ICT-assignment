export class User {
    constructor(id, username, groups, channels, avatar, status, email, dob, password, superAdmin, valid) {
        this._id = id,
        this.username = username,
        this.groups = groups,
        this.channels = channels,

        this.avatar = avatar,
        this.status = status,
        this.email = email,
        this.dob = dob,

        this.password = password,
        this.superAdmin = superAdmin,
        this.valid = valid
    }
}