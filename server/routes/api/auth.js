const express = require('express');
const { readJson } = require('../../utilities/fileDb')    // handle JSON read/write (temp: until mongoDB)
const router = express.Router();


// POST login process
router.post('/login', (req, res) => {
    // debugging
    console.log("Received login: ", req.body);
    // return error if there is no body
    if (!req.body) return res.sendStatus(400);

    // initialize customer object
    let customer = {
        email: req.body.email,
        password: req.body.password,
        valid: false
    };
    
    // read users data
    const users = readJson("users.json");
    // try to find a match
    const user = users.find(user => user.email == customer.email && user.password == customer.password);

    if (!user) { 
        // invalid login
        customer = ({ password: '', valid: false });
    } else if (user) {
        // valid login gets their details
        customer = {
            id: user.id,
            username: user.username,
            email: user.email,
            groups: user.groups,
            password: '',           // reset password
            avatar: user.avatar,
            superAdmin: user.superAdmin,
            valid: true
        };
    }
    // return the customer object
    res.send(customer);
});

module.exports = router;
