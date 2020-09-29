const path = require("path");
const fs = require("fs");
const config = require("./config");
const mime = require("mime-types");

module.exports = (req, res, next) => {
  try {
    const filePath = path.join(process.cwd(), config.contentBase, req.url);
    return fs.readFile(filePath, (err, data) => {
      if (err) return next();
      res.setHeader("content-type", mime.lookup(filePath));
      res.end(data);
    });
  } catch {
    console.log("static file not found");
    next();
  }
};
