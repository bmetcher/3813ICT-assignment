const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ensure upload directories exist
const avatarsDir        = path.join(__dirname, '../public/avatars');
const groupIconsDir     = path.join(__dirname, '../public/groupIcons');
const attachmentsDir    = path.join(__dirname, '../public/attachments');

// configure where and how to save avatar files
const avatarStorage = multer.diskStorage({
    // where to save a file
    destination: function (req, file, cb) {
        cb(null, avatarsDir);
    },
    // what to name the file
    filename: function (req, file, cb) {
        // get file extension (.jpg, .png..)
        const ext = path.extname(file.originalname);
        // use userId as filename (like "userId.jpg")
        const userId = req.userId;  // from authenticate
        cb(null, `${userId}${ext}`);
    }
});

// filter for image files
const imageFilter = function (req, file, cb) {
    // allowed file types
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    // check extension
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    // check MIME type
    const mimetype = allowedTypes.test(file.mimetype);

    // check the file is safe & matches as it is supposed to
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files are allowed: jpeg, jpg, png, gif, webp'));
    }
};

// upload middleware for avatars
const uploadAvatar = multer({
    storage: avatarStorage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB is the maximum
    },
    fileFilter: imageFilter
});

module.exports = { uploadAvatar };
