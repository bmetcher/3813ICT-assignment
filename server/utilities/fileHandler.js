const fs = require("fs");
const path = require("path");

// read an existing file from /data
function readJson(file) {
    const filePath = path.join(__dirname, "../data", file);
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
}
// save (overwrite) given data to a file in /data
function writeJson(file, data) {
    const filePath = path.join(__dirname, "../data", file);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

module.exports = { readJson, writeJson };