// (--save-dev: mocha, chai, supertest)
const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const { connect, getDb } = require('../mongo');
const app = require('../server');
const bcrsypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');

const SUPER_USER_ID = new ObjectId('68eb82a141b296915cdb8b60');
const SUPER_GROUPD_ID = new ObjectId('68eb86131c640a9dcb4e9dd7');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

let db;
let token;
let userIds = [];
let groupIds = [];
let channelIds = [];
let messageIds = [];
let banIds = [];

// ## User Helpers ##
async function createUser(username, email, password = '123456') {
    const res = await request(app)
        .post('/api/users')
        .send({
            username, 
            email,
            password,
            avatar: 'public/avatars/default.png',
            status: 'offline',
            dob: new Date('1990-01-01')
        })
        .set('Authorization', `Bearer ${token}`);

    if (!res.body.createdUser) throw new Error(`User creation failed: ${JSON.stringiify(res.body)}`);

    userIds.push(res.body.createdUser._id);
    return res.body.createdUser._id;
}

async function updateUser(userId, updates) {
    const res = await request(app)
        .put(`/api/users/${userId}`)
        .send(updates)
        .set('Authorization', `Bearer ${token}`);
    return res;
}

async function updatePassword(userId, oldPassword, newPassword) {
    const res = await request(app)
        .put(`/api/users/${userId}/password`)
        .send({ oldPassword, newPassword })
        .set('Authorization', `Bearer ${token}`);
    return res;
}

async function deleteUser(userId) {
    const res = await request(app)
        .delete(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${token}`);
    return res;
}

async function getUsersByGroup(groupId) {
    const res = await request(app)
        .get(`/api/users/group/${groupId}`)
        .set('Authorization', `Bearer ${token}`);
    return res;
}

async function getUsersByChannel(channelId) {
    const res = await request(app)
        .get(`/api/users/channel/${channelId}`)
        .set('Authorization', `Bearer ${token}`);
    return res;
}


// ## Group Helpers ##
async function createGroup(name) {
    const res = await request(app)
        .post('/api/groups')
        .send({
            group: { name },
            imageUrl: 'public/groupIcons/default.png'
        })
        .set('Authorization', `Bearer ${token}`);

    if (!res.body.createdGroup) throw new Error(`Group creation failed: ${JSON.stringiify(res.body)}`);
    
    groupIds.push(res.body.createdGroup._id);
    return res.body.createdGroup._id;
}

async function getGroupsByUser(userId) {
    const res = await request(app)
        .get(`/api/groups/${userId}`)
        .set('Authorization', `Bearer ${token}`);
    return res;
}

async function updateGroup(groupId, updates) {
    const res = await request(app)
        .put(`/api/groups/${groupId}`)
        .send(updates)
        .set('Authorization', `Bearer ${token}`);
    return res;
}

async function deleteGroup(groupId) {
    const res = await request(app)
        .delete(`/api/groups/${groupId}`)
        .set('Authorization', `Bearer ${token}`);
    return res;
}

async function promoteToAdmin(groupId, userId) {
    const res = await request(app)
        .put(`/api/groups/${groupId}/${userId}`)
        .send({ newRole: 'admin' })
        .set('Authorization', `Bearer ${token}`);
    return res;
}

async function demoteToUser(groupId, userId) {
    const res = await request(app)
        .put(`/api/groups/${groupId}/${userId}`)
        .send({ newRole: 'user' })
        .set('Authorization', `Bearer ${token}`);
    return res;
}

async function inviteUserToGroup(groupId, userId) {
    const res = await request(app)
        .put(`/api/groups/${groupId}/${userId}/invite`)
        .set('Authorization', `Bearer ${token}`);
    return res;
}


// ## Channel Helpers ##
async function createChannel(name, groupId, description = '') {
    const res = await request(app)
        .post('/api/channels')
        .send({ 
            channel: {
                name,
                groupId,
                description
            }
        })
        .set('Authorization', `Bearer ${token}`);

    console.log('createChannel response:', res.status, res.body);
    if (res.status !== 201 || !res.body.newChannel) {
        throw new Error(`Channel creation failed: ${JSON.stringiify(res.body)}`);
    }
    channelIds.push(res.body.newChannel._id);
    return res.body.newChannel._id;
}

async function getChannelsByGroup(groupId) {
    const res = await request(app)
        .get(`/api/channels/${groupId}`)
        .set('Authorization', `Bearer ${token}`);
    return res;
}

async function updateChannel(channelId, updates) {
    const res = await request(app)
        .put(`/api/channels/${channelId}`)
        .send(updates)
        .set('Authorization', `Bearer ${token}`);
    return res;
}

async function deleteChannel(channelId) {
    const res = await request(app)
        .get(`/api/channels/${channelId}`)
        .set('Authorization', `Bearer ${token}`);
    return res;
}

// ## Message Helpers ##
async function createMessage(channelId, content) {
    const res = await request(app)
        .post(`/api/messages/channel/${channelId}`)
        .send({ content })
        .set('Authorization', `Bearer ${token}`);

    if (res.status !== 201 && !res.body.createdMessage) {
        throw new Error(`Message creation failed: ${JSON.stringiify(res.body)}`);
    }
    messageIds.push(res.body.createdMessage._id);
    return res.body.createdMessage?._id;
}

async function getMessages(channelId, limit = 50, before = null) {
    let url = `/api/messages/channel/${channelId}?limit=${limit}`;
    if (before) url += `&before=${before}`;

    const res = await request(app)
        .get(url)
        .set('Authorization', `Bearer ${token}`);
    return res;
}

async function updateMessage(channelId, messageId, content) {
    const res = await request(app)
        .put(`/api/messages/channel/${channelId}/message/${messageId}`)
        .send({ content })
        .set('Authorization', `Bearer ${token}`);
    return res;
}

async function deleteMessage(channelId, messageId) {
    const res = await request(app)
        .delete(`/api/messages/channel/${channelId}/message/${messageId}`)
        .set('Authorization', `Bearer ${token}`);
    return res;
}


// ## Ban Helpers ##
async function banUserFromGroup(groupId, userId, reason = 'Test ban') {
    const res = await request(app)
        .post(`/api/bans/group/${groupId}/user/${userId}`)
        .send({ reason })
        .set('Authorization', `Bearer ${token}`);

    if (res.body.createdBan) banIds.push(res.body.createdBan._id);
    return res;
}

async function banUserFromChannel(groupId, channelId, userId, reason = 'Test ban') {
    const res = await request(app)
        .post(`/api/bans/group/${groupId}/channel/${channelId}/user/${userId}`)
        .send({ reason })
        .set('Authorization', `Bearer ${token}`);

    if (res.body.createdBan) banIds.push(res.body.createdBan._id);
    return res;
}

async function getActiveBansForGroup(groupId) {
    const res = await request(app)
        .get(`/api/bans/group/${groupId}/active`)
        .set('Authorization', `Bearer ${token}`);
    return res;
}

async function getAllBansForGroup(groupId) {
    const res = await request(app)
        .get(`/api/bans/group/${groupId}/all`)
        .set('Authorization', `Bearer ${token}`);
    return res;
}

async function updateBan(banId, updates) {
    const res = await request(app)
        .get(`/api/bans/${banId}`)
        .send(updates)
        .set('Authorization', `Bearer ${token}`);
    return res;
}

async function deleteBan(banId) {
    const res = await request(app)
        .get(`/api/bans/${banId}`)
        .set('Authorization', `Bearer ${token}`);
    return res;
}

// ## Testing ##
describe('Comprehensive CRUD Operation Testing', function () {
    this.timeout(10000);

    before(async() => {
        // connect to test db
        await connect('mongodb://192.168.10.100:27017', 'chat-app');
        db = getDb();

        console.log('\n #### Clearing Database !! ####');
        // Clear ALL collections
        await db.collection('users').deleteMany({});
        await db.collection('groups').deleteMany({});
        await db.collection('channels').deleteMany({});
        await db.collection('memberships').deleteMany({});
        await db.collection('messages').deleteMany({});
        await db.collection('bans').deleteMany({});
        console.log('All collections cleared');

        console.log('\n #### Creating Super Admin ####');
        // Create super admin user
        const hashedPassword = await bcrsypt.hash('superpassword', 10);
        await db.collection('users').insertOne({
            _id: SUPER_USER_ID,
            email: 'super@admin.com',
            username: 'Super',
            password: hashedPassword,
            avatar: 'public/avatars/default.png',
            status: 'online',
            dob: new Date('1999-09-09')
        });
        console.log('Super admin created');

        // Create super group
        await db.collection('groups').insertOne({
            _id: SUPER_GROUPD_ID,
            name: 'Super Group',
            imageUrl: 'public/groupIcons/default.png',
            bannedUsers: [],
            createdBy: SUPER_USER_ID,
            createdAt: new Date()
        });
        console.log('Super group created');

        // Create super admin membership
        await db.collection('memberships').insertOne({
            userId: SUPER_USER_ID,
            groupId: SUPER_GROUPD_ID,
            role: 'super'
        });
        console.log('Super admin membership created');

        console.log('#### Logging in as Super ####');
        // verify token works by attempting login
        const login = await request(app)
            .post('/api/login')
            .send({ email: 'super@admin.com', password: 'superpassword' });

        console.log('Login response:', login.status);
        
        if (!login.body?.token) throw new Error('Failed to log in as super admin');
        // use the token from the actual login
        token = login.body.token;
        userIds.push(SUPER_USER_ID.toString());
        console.log('\n #### Starting Tests! ####');
    });

    // ## User Tests ##
    describe('User CRUD Operations', () => {
        it('should create normal users', async () => {
        const alice = await createUser('Alice', 'alice@example.com');
        const bob = await createUser('Bob', 'bob@example.com');
        const glenn = await createUser('Glenn', 'glenn@example.com');

        expect(userIds.length).to.equal(4); // 3 new users + super admin
        console.log('Created 3 users');
        });

        it('should update a user profile', async () => {
            const res = await updateUser(userIds[1], {
                username: 'Alice Updated',
                status: 'busy'
            });

            expect(res.status).to.equal(200);
            expect(res.body.updatedUser.username).to.equal('Alice Updated');
            expect(res.body.updatedUser.status).to.equal('busy');
            console.log('Updated user profile');
        });

        it('should update user password', async () => {
            const res = await updatePassword(userIds[1], '123456', 'newpassword123');
            expect(res.status).to.equal(200);
            console.log('Updated user password');
        });

        it('should get users by group (after group setup)', async () => {
            // this will be tested after groups are created
        });
    });
    
    // ## Group Tests ##
    describe('Group CRUD Operations', () => {
        it('should create groups', async () => {
            await createGroup('Staff Group');
            await createGroup('Class 201 Group');

            expect (groupIds.length).to.equal(2);
            console.log('Created 2 groups');
        });

        it('should get groups for user', async () => {
            const res = await getGroupsByUser(SUPER_USER_ID.toString());
            expect(res.status).to.equal(200);
            expect(res.body.groups).to.be.an('array');
            expect(res.body.groups.length).to.be.at.least(2);
            console.log(`Retrieved ${res.body.groups.length} groups for super admin`);
        });

        it('should update group details', async () => {
            const res = await updateGroup(groupIds[0], {
                name: 'Dev Team Updated',
                imageUrl: 'public/groupIcons/dev.png'
            });

            expect(res.status).to.equal(200);
            expect(res.body.group.name).to.equal('Staff Group Updated');
            console.log('Updated group details');
        });

        it('should invite users to groups', async () => {
            const res1 = await inviteUserToGroup(groupIds[0], userIds[1]);   // Alice to Group 1
            const res2 = await inviteUserToGroup(groupIds[0], userIds[2]);   // Bob to Group 1
            const res3 = await inviteUserToGroup(groupIds[1], userIds[3]);   // Glenn to Group 2
            console.log('Invited users to groups');

            expect(res1.status).to.equal(200);
            expect(res2.status).to.equal(200);
            expect(res3.status).to.equal(200);
            console.log('Invited users to groups');
        });

        it('should get users in a group', async () => {
            const res = await getUsersByGroup(groupIds[0]);
            expect(res.status).to.equal(200);
            expect(res.body.users).to.be.an('array');
            expect(res.body.users.length).to.be.at.least(2);
            console.log(`Retrieved ${res.body.users.length} users in group`);
        });

        it('should promote user to group admin', async () => {
            const res = await promoteToAdmin(groupIds[0], userIds[1]);
            expect(res.status).to.equal(200);
            expect(res.body.updatedMembership.role).to.equal('admin');
            console.log('Promoted user to admin');
        });

        it('should demote admin to user', async () => {
            const res = await demoteToUser(groupIds[0], userIds[1]);
            expect(res.status).to.equal(200);
            expect(res.body.updatedMembership.role).to.equal('user');
            console.log('Demoted admin to user');
        });
    });

    // ## Channel Tests ##
    describe('Channel CRUD Operations', () => {
        it('should create channels', async () => {
            await createChannel('general', groupIds[0], 'Important Announcements');
            await createChannel('random', groupIds[0], 'General Discussions');
            await createChannel('offtopic', groupIds[1], 'Off-topic Discussions');

            expect(channelIds.length).to.equal(3);
            console.log('Created 3 channels');
        });

        it('should get channels for a group', async () => {
            const res = await getChannelsByGroup(groupIds[0]);
            expect(res.status).to.equal(200);
            expect(res.body.channels).to.be.an('array');
            expect(res.body.channels.length).to.be.at.least(2);
            console.log(`Retrieved ${res.body.channels.length} channels for group`);
        });

        it('should get users in a channel', async () => {
            const res = await getUsersByChannel(channelIds[0]);
            expect(res.status).to.equal(200);
            expect(res.body.users).to.be.an('array');
            console.log(`Retrieved ${res.body.users.length} users in channel`);
        });

        it('should update channel details', async() => {
            const res = await updateChannel(channelIds[0], {
                name: 'general-updated',
                description: 'Updated description'
            });
            
            expect(res.status).to.equal(200);
            expect(res.body.channel.name).to.equal('general-updated');
            console.log('Updated channel details');
        });

        it('should delete a channel', async () => {
            const res = await deleteChannel(channelIds[2]);
            expect(res.status).to.equal(200);
            console.log('Deleted channel');
        });
    });
    
    // ## Message Tests ##
    describe('Message CRUD Operations', () => {
        it('should create messages', async () => {
            await createMessage(channelIds[0], userIds[1], 'Hello everyone!');
            await createMessage(channelIds[0], userIds[2], 'How is everyone doing?');
            await createMessage(channelIds[2], userIds[3], 'This is a test message');

            expect(messageIds.length).to.equal(3);
            console.log('Created 3 messages');
        });

        it('should get messages from a channel', async () => {
            const res = await getMessages(channelIds[0]);
            expect(res.status).to.equal(200);
            expect(res.body.messages).to.be.an('array');
            expect(res.body.messages.length).to.equal(3);
            console.log(`Retrieved ${res.body.messages.length} messages`);
        });

        it('should get paginated messages', async () => {
            const res = await getMessages(channelIds[0], 2);
            expect(res.status).to.equal(200);
            expect(res.body.messages.length).to.be.at.most(2);
            console.log('Retrieved paginated messages');
        });

        it('should update a message', async () => {
            const res = await updateMessage(channelIds[0], messageIds[0], 'Updated message content');
            expect(res.status).to.equal(200);
            expect(res.body.updatedMessage.content).to.equal('Updated message content');
            console.log('Updated message');
        });

        it('should delete a message', async () => {
            const res = await deleteMessage(channelIds[0], messageIds[2]);
            expect(res.status).to.equal(200);
            console.log('Deleted message');
        });
    })
    
    // ## Ban Tests ##
    describe('Ban CRUD Operations', () => {
        it('should ban user from group', async () => {
            const res = await banUserFromGroup(groupIds[0], userIds[2], 'Violated rules');
            expect(res.status).to.equal(201);
            console.log('Banned user from group');
        });

        it('should ban user from channel', async () => {
            const res = await banUserFromChannel(groupIds[0], channelIds[0], userIds[1], 'Spam');
            expect(res.status).to.equal(201);
            console.log('Banned user from channel');
        });

        it('should get active bans for group', async () => {
            const res = await getActiveBansForGroup(groupIds[0]);
            expect(res.status).to.equal(200);
            expect(res.body.bans).to.be.an('array');
            console.log(`Retrieved ${res.body.bans.length} active bans`);
        });

        it('should get all bans for group', async () => {
            const res = await getAllBansForGroup(groupIds[0]);
            expect(res.status).to.equal(200);
            expect(res.body.bans).to.be.an('array');
            console.log(`Retrieved ${res.body.bans.length} total bans`);
        });

        it('should update ban reason', async () => {
            if (banIds.length > 0) {
                const res = await updateBan(banIds[0], { reason: 'Updated reason' });
                expect(res.status).to.equal(200);
                console.log('Updated ban reason');
            }
        });

        it('should delete a ban', async () => {
            if (banIds.length > 0) {
                const res = await deleteBan(banIds[0]);
                expect(res.status).to.equal(200);
                console.log('Deleted ban');
            }
        });
    });

    // ## Delete Post-Tests ##
    describe('Delete Operations', () => {
        it('should delete a user', async () => {
            const res = await deleteUser(userIds[3]);
            expect(res.status).to.equal(200);
            console.log('Deleted user');
        });

        it('should delete a group & children', async () => {
            const res = await deleteGroup(groupIds[1]);
            expect(res.status).to.equal(200);
            console.log('Deleted group & children')
        });
    });

    after(async () => {
        console.log('\n#### Test Summary ####');
        console.log('Users created:', userIds.length);
        console.log('Groups created:', groupIds.length);
        console.log('Channels created:', channelIds.length);
        console.log('Messages created:', messageIds.length);
        console.log('Bans created:', banIds.length);

        // close connection
        const client = db.client;
        if (client) await client.close();
        console.log('Database connection closed');
    });
});