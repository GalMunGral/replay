const util = require("util");
const babel = require("@babel/core");
const transform = util.promisify(babel.transform);

module.exports = (file) => {
  return transform(file.content, {
    plugins: [require.resolve("@babel/plugin-transform-typescript")],
  }).then(({ code }) => ({
    ...file,
    content: code,
  }));
};
