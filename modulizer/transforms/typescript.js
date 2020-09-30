const util = require("util");
const babel = require("@babel/core");
const transform = util.promisify(babel.transform);

module.exports = (module) => {
  return transform(module.content, {
    plugins: [require.resolve("@babel/plugin-transform-typescript")],
  }).then(({ code }) => ({
    ...module,
    content: code,
  }));
};
