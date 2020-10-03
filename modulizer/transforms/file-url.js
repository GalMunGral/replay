const fs = require("fs");
const path = require("path");
const util = require("util");
const config = require("../config");
const copyFile = util.promisify(fs.copyFile);

const root = process.cwd();

module.exports = (filePath) => {
  const filename = path.basename(filePath);
  const outputPath = path.join(process.cwd(), config.contentBase, filename);
  return copyFile(filePath, outputPath).then(() => ({
    path: filePath,
    moduleId: "/" + path.relative(root, filePath),
    content: `export default "/${filename}"`,
  }));
};
