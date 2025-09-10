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
    const userId = req.params.id;

    // read current users
    const users = readJson('users.json');

    // check if the user exists
    const userIndex = users.findIndex(user => user.id === userId);
    if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
    }

    // remove the user
    users.splice(userIndex, 1);
    // save the list
    writeJson('users.json', users);
    // "OK" (200)
    res.status(200).json({ message: 'User deleted successfully'});
})

module.exports = router;