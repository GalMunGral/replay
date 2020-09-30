const path = require("path");
const fs = require("fs");
const config = require("./config");
const mime = require("mime-types");

module.exports = (stream, headers, next) => {
  try {
    const filePath = path.join(
      process.cwd(),
      config.contentBase,
      headers[":path"]
    );
    return fs.readFile(filePath, (err, data) => {
      if (err) return next();
      stream.respond({ "content-type": mime.lookup(filePath) });
      stream.end(data);
    });
  } catch {
    console.log("static file not found");
    next();
  }
};
