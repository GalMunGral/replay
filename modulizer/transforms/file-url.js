const fs = require("fs");
const path = require("path");
const util = require("util");
const mime = require("mime-types");
const config = require("../config");
const copyFile = util.promisify(fs.copyFile);
const readFile = util.promisify(fs.readFile);
const stat = util.promisify(fs.stat);

const root = process.cwd();

module.exports = async (filePath) => {
  const filename = path.basename(filePath);
  const outputPath = path.join(process.cwd(), config.contentBase, filename);

  if ((await stat(filePath)).size <= 4096) {
    // inline using base64 data URL
    const mimeType = mime.lookup(filePath);
    const base64Encoded = await readFile(filePath, { encoding: "base64" });
    const dataURL = `data:${mimeType};base64,${base64Encoded}`;
    return {
      path: filePath,
      moduleId: "/" + path.relative(root, filePath),
      content: `export default "${dataURL}"`,
    };
  } else {
    await copyFile(filePath, outputPath);
    return {
      path: filePath,
      moduleId: "/" + path.relative(root, filePath),
      content: `export default "/${filename}"`,
    };
  }
};
