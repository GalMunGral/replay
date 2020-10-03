const util = require("util");
const babel = require("@babel/core");
const transform = util.promisify(babel.transform);

module.exports = (file) =>
  transform(file.content, {
    plugins: [
      require.resolve("@babel/plugin-proposal-class-properties"),
      require.resolve("@babel/plugin-transform-modules-commonjs"),
    ],
  }).then(({ code }) => ({
    ...file,
    content: code,
  }));
