const multer = require('multer');

const uploadNone = multer({
    limits:{
        fieldNameSize:255,
        fieldSize: 2 * 1024 * 1024,
        fields: 10,
        fileSize:0,
        files:0
    }
}).none();

const upload = multer({
    limits:{
        fieldNameSize:255,
        fieldSize: 2 * 1024 * 1024,
        fields: 10,
        fileSize:5 * 1024 * 1024,
        files:1
    }
});

module.exports = {uploadNone,upload}