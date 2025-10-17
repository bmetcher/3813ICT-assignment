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

// Attachment storage config
const attachmentStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, attachmentsDir),
    filename: (req, file, cb) => {
        // maybe convert to use messageId instead
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

// filter for image files
const imageFilter = function (req, file, cb) {
    // allowed file types
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    // check it's the appropriate & safe combination
    if (allowedTypes.includes(file.mimetype)) {
        return cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed'));
    }
};

// upload middleware for avatars
const uploadAvatar = multer({
    storage: avatarStorage,
    limits: {
        fileSize: 8 * 1024 * 1024 // 8MB is the maximum
    },
    fileFilter: imageFilter
});
// upload image attachments
const uploadAttachment = multer({
    storage: attachmentStorage,
    fileFilter: imageFilter,
    limits: { fileSize: 8 * 1024 * 1024 } // 8MB size limit
})

module.exports = { uploadAvatar, uploadAttachment };
