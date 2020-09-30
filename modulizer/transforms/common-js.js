const util = require("util");
const babel = require("@babel/core");
const transform = util.promisify(babel.transform);

module.exports = (module) =>
  transform(module.content, {
    plugins: [
      require.resolve("@babel/plugin-proposal-class-properties"),
      require.resolve("babel-plugin-transform-commonjs"),
    ],
  }).then(({ code }) => ({
    ...module,
    content: code,
  }));
