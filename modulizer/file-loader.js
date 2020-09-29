const fs = require("fs");
const path = require("path");
const config = require("./config");

module.exports = (src, cb) => {
  fs.writeFile(path.join(__dirname, "test.png"), src, () => {});
  cb(null, `export default ''`);
};
