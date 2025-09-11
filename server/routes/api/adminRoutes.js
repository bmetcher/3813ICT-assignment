const express = require('express');
const router = express.Router();
const { readJson, writeJson } = require('../../utilities/fileDb')

// POST creating new user
router.post('/users', (req, res) => {
    const { username } = req.body;
    // read users data
    const users = readJson("users.json");

    // validation
    if (!username || username.trim() === '') {
        // bad request (400): missing data
        return res.status(400).json({ error: 'Username is required'});
    }
    if (users.some(user => user.username == username)) {
        // conflict (409): duplicate username
        return res.status(409).json({ error: 'That username already exists!'});
    }

    const newUser = {
        ...req.body,
        id: (users.length + 1).toString()  // later: mongo UID
    };

    // overwrite with updated users data
    users.push(newUser);
    writeJson('users.json', users);

    // a new resource was successfully created (201)
    console.log("User created: ", newUser);
    res.status(201).json(newUser);  
});

// DELETE removing a user
router.delete('/users/:id', (req, res) => {
    // read the id & users list data
    const userId = req.params.id;
    const users = readJson('users.json');

    // check if the user exists
    const userIndex = users.findIndex(user => user.id === userId);
    if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
    }

    // remove the user & save over the data
    users.splice(userIndex, 1);
    writeJson('users.json', users);

    // (200) = OK
    res.status(200).json({ message: 'User deleted successfully'});
})

// POST createing a new group
router.post('/groups', (req, res) => {
    const { name } = req.body;
    const groups = readJson('groups.json');
    const channels = readJson('channels.json');

    if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'Group name is required' });
    }
    if (groups.some(group => group.name === name)) {
        return res.status(409).json({ error: 'That group name already exists!' });
    }

    // set the new group's values
    const newGroup = {
        id: (groups.length + 1).toString(),
        name: name,
        admins: ['1'],    // arbitrary only super admin for now -- ** add "currentUser"
        members: ['1'],   // " "
        channels: (channels.length + 1).toString(),
        open: false
    };

    // add the group to the list & overwrite the file
    groups.push(newGroup);
    writeJson('groups.json', groups);
    
    // (201) = success; new resource created
    res.status(201).json(newGroup);
});

// DELETE a group
router.delete('/groups/:id', (req, res) => {
    // read the id & groups data
    const groupId = req.params.id;
    const groups = readJson('groups.json');
    
    // try to find the group
    const groupIndex = groups.findIndex(group => group.id === groupId);
    if (groupIndex === -1) {
        return res.status(404).json({ error: 'Group not found' });
    }

    // remove the group & overwrite the groups file
    groups.splice(groupIndex, 1);
    writeJson('groups.json', groups);

    // (200) = OK
    res.status(200).json({ message: 'Group deleted successfully' });
})

module.exports = router;