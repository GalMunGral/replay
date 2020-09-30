const fs = require("fs");
const path = require("path");
const util = require("util");
const config = require("../config");
const copyFile = util.promisify(fs.copyFile);

module.exports = (file) => {
  const filename = path.basename(file.path);
  const outputPath = path.join(process.cwd(), config.contentBase, filename);
  return copyFile(file.path, outputPath).then(() => ({
    ...file,
    content: `export default "/${filename}"`,
  }));
};
