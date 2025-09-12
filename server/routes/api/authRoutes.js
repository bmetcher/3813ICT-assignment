const express = require('express');
const router = express.Router();
const { readJson } = require('../../utilities/fileHandler')    // handle JSON read/write (temp: until mongoDB)


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

// GET context; return appropriate users?/groups/channels for the user
// application.get("/context", (req, res) => {
//     const user = req.user;

//     if (!user) {
//         return.res.status(401).json({ error: "Not authorized" });
//     }

//     //...
//     res.json({ groups, channels, users });
// })


module.exports = router;
